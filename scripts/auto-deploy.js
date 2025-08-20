const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function autoDeploy() {
  console.log("🤖 Auto-deploy: Checking if contract needs deployment...");
  
  // Проверяем, есть ли уже задеплоенный контракт
  const deploymentFile = path.join(__dirname, '..', 'localhost-deployment.json');
  
  if (fs.existsSync(deploymentFile)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    console.log("✅ Contract already deployed:", deployment.contractAddress);
    
    // Проверяем, что контракт еще существует в сети
    try {
      const code = await ethers.provider.getCode(deployment.contractAddress);
      if (code !== "0x") {
        console.log("✅ Contract is active on the network");
        return deployment.contractAddress;
      } else {
        console.log("⚠️  Contract not found on network, redeploying...");
        fs.unlinkSync(deploymentFile); // Удаляем старый файл
      }
    } catch (error) {
      console.log("⚠️  Error checking contract, redeploying...");
      fs.unlinkSync(deploymentFile);
    }
  }
  
  // Деплоим новый контракт
  console.log("🚀 Deploying new contracts...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
    
    // 1. Деплоим мок токены для localhost
    console.log("📦 Deploying mock tokens...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    
    const mockUSDC = await MockERC20.deploy("Mock USD Coin", "USDC");
    await mockUSDC.waitForDeployment();
    const usdcAddress = await mockUSDC.getAddress();
    console.log("✅ Mock USDC deployed:", usdcAddress);
    
    const mockUSDT = await MockERC20.deploy("Mock Tether", "USDT");
    await mockUSDT.waitForDeployment();
    const usdtAddress = await mockUSDT.getAddress();
    console.log("✅ Mock USDT deployed:", usdtAddress);
    
    const mockDAI = await MockERC20.deploy("Mock Dai Stablecoin", "DAI");
    await mockDAI.waitForDeployment();
    const daiAddress = await mockDAI.getAddress();
    console.log("✅ Mock DAI deployed:", daiAddress);
    
    // 2. Деплоим ImprovedProxySwap
    console.log("💱 Deploying ImprovedProxySwap...");
    const ImprovedProxySwap = await ethers.getContractFactory("ImprovedProxySwap");
    const contract = await ImprovedProxySwap.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("✅ New contract deployed:", address);
    
    // 3. Минтим токены для тестирования
    console.log("� Minting test tokens...");
    const mintAmount = ethers.parseUnits("1000000", 6); // 1M токенов для USDC/USDT
    const daiMintAmount = ethers.parseUnits("1000000", 18); // 1M DAI
    
    // Минтим на контракт для ликвидности
    await mockUSDC.mint(address, mintAmount);
    await mockUSDT.mint(address, mintAmount);
    await mockDAI.mint(address, daiMintAmount);
    
    // Минтим деплоеру для тестирования
    await mockUSDC.mint(deployer.address, ethers.parseUnits("10000", 6));
    await mockUSDT.mint(deployer.address, ethers.parseUnits("10000", 6));
    await mockDAI.mint(deployer.address, ethers.parseUnits("10000", 18));
    
    console.log("💰 Test tokens minted successfully");
    
    // 4. Устанавливаем базовые курсы
    console.log("🔧 Setting up exchange rates...");
    
    const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
    
    try {
      // Примерные курсы для тестирования (ETH = $2500)
      await contract.setExchangeRate(ETH_ADDRESS, usdcAddress, ethers.parseUnits("2500", 6));
      await contract.setExchangeRate(ETH_ADDRESS, usdtAddress, ethers.parseUnits("2500", 6));
      await contract.setExchangeRate(ETH_ADDRESS, daiAddress, ethers.parseUnits("2500", 18));
      
      await contract.setExchangeRate(usdcAddress, ETH_ADDRESS, ethers.parseEther("0.0004"));
      await contract.setExchangeRate(usdtAddress, ETH_ADDRESS, ethers.parseEther("0.0004"));
      await contract.setExchangeRate(daiAddress, ETH_ADDRESS, ethers.parseEther("0.0004"));
      
      // Токен -> токен (1:1 для стейблкоинов)
      await contract.setExchangeRate(usdcAddress, usdtAddress, ethers.parseUnits("1", 6));
      await contract.setExchangeRate(usdtAddress, usdcAddress, ethers.parseUnits("1", 6));
      await contract.setExchangeRate(usdcAddress, daiAddress, ethers.parseUnits("1", 18));
      await contract.setExchangeRate(daiAddress, usdcAddress, ethers.parseUnits("1", 6));
      await contract.setExchangeRate(usdtAddress, daiAddress, ethers.parseUnits("1", 18));
      await contract.setExchangeRate(daiAddress, usdtAddress, ethers.parseUnits("1", 6));
      
      console.log("✅ Exchange rates configured");
    } catch {
      console.log("⚠️  Exchange rates setup failed (can be set later)");
    }
    
    // Сохраняем информацию о деплойменте
    const deploymentInfo = {
      network: "localhost",
      contractAddress: address,
      deployerAddress: deployer.address,
      deploymentTime: new Date().toISOString(),
      transactionHash: contract.deploymentTransaction()?.hash,
      contractType: "ImprovedProxySwap",
      autoDeployed: true,
      mockTokens: {
        USDC: usdcAddress,
        USDT: usdtAddress,
        DAI: daiAddress
      }
    };
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved");
    
    // Автоматически обновляем constants.ts
    await updateConstants(address, { USDC: usdcAddress, USDT: usdtAddress, DAI: daiAddress });
    
    console.log("🎉 Auto-deployment completed!");
    return address;
    
  } catch (error) {
    console.error("❌ Auto-deployment failed:", error.message);
    return null;
  }
}

async function updateConstants(contractAddress, tokenAddresses) {
  try {
    const constantsPath = path.join(__dirname, '..', 'src', 'app', 'utils', 'constants.ts');
    
    if (!fs.existsSync(constantsPath)) {
      console.log("⚠️  constants.ts not found, skipping update");
      return;
    }
    
    let content = fs.readFileSync(constantsPath, 'utf8');
    
    // Обновляем CONTRACT_ADDRESSES для localhost
    const contractPattern = /(localhost:\s*')[^']*(')/;
    if (contractPattern.test(content)) {
      content = content.replace(contractPattern, `$1${contractAddress}$2`);
      console.log("✅ Updated contract address in constants.ts");
    }
    
    // Обновляем TOKEN_ADDRESSES для localhost если есть мок токены
    if (tokenAddresses) {
      // Обновляем USDC
      const usdcPattern = /(localhost:\s*')[^']*(',\s*\/\/\s*USDC)/;
      if (usdcPattern.test(content)) {
        content = content.replace(usdcPattern, `$1${tokenAddresses.USDC}$2`);
      }
      
      // Обновляем USDT
      const usdtPattern = /(localhost:\s*')[^']*(',\s*\/\/\s*USDT)/;
      if (usdtPattern.test(content)) {
        content = content.replace(usdtPattern, `$1${tokenAddresses.USDT}$2`);
      }
      
      // Обновляем DAI
      const daiPattern = /(localhost:\s*')[^']*(',\s*\/\/\s*DAI)/;
      if (daiPattern.test(content)) {
        content = content.replace(daiPattern, `$1${tokenAddresses.DAI}$2`);
      }
      
      console.log("✅ Updated token addresses in constants.ts");
    }
    
    fs.writeFileSync(constantsPath, content, 'utf8');
    console.log("✅ constants.ts updated automatically");
  } catch (error) {
    console.log("⚠️  Failed to update constants.ts:", error.message);
  }
}

module.exports = { autoDeploy };

// Если запускается напрямую
if (require.main === module) {
  autoDeploy()
    .then((address) => {
      if (address) {
        console.log(`\n✅ Contract ready at: ${address}`);
      } else {
        console.log("\n❌ Auto-deployment failed");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Auto-deploy error:", error);
      process.exit(1);
    });
}
