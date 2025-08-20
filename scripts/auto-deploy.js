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
  console.log("🚀 Deploying new contract...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
    
    // Деплоим ImprovedProxySwap
    const ImprovedProxySwap = await ethers.getContractFactory("ImprovedProxySwap");
    const contract = await ImprovedProxySwap.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("✅ New contract deployed:", address);
    
    // Устанавливаем базовые курсы
    console.log("🔧 Setting up exchange rates...");
    
    const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    
    try {
      // Примерные курсы для тестирования
      await contract.setExchangeRate(ETH_ADDRESS, USDC_ADDRESS, ethers.parseUnits("2500", 6));
      await contract.setExchangeRate(ETH_ADDRESS, USDT_ADDRESS, ethers.parseUnits("2500", 6));
      await contract.setExchangeRate(ETH_ADDRESS, WETH_ADDRESS, ethers.parseEther("1"));
      
      await contract.setExchangeRate(USDC_ADDRESS, ETH_ADDRESS, ethers.parseEther("0.0004"));
      await contract.setExchangeRate(USDT_ADDRESS, ETH_ADDRESS, ethers.parseEther("0.0004"));
      await contract.setExchangeRate(WETH_ADDRESS, ETH_ADDRESS, ethers.parseEther("1"));
      
      console.log("✅ Exchange rates configured");
    } catch (error) {
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
      autoDeployed: true
    };
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved");
    
    // Автоматически обновляем constants.ts
    await updateConstants(address);
    
    console.log("🎉 Auto-deployment completed!");
    return address;
    
  } catch (error) {
    console.error("❌ Auto-deployment failed:", error.message);
    return null;
  }
}

async function updateConstants(contractAddress) {
  try {
    const constantsPath = path.join(__dirname, '..', 'src', 'app', 'utils', 'constants.ts');
    
    if (!fs.existsSync(constantsPath)) {
      console.log("⚠️  constants.ts not found, skipping update");
      return;
    }
    
    let content = fs.readFileSync(constantsPath, 'utf8');
    
    // Обновляем PROXY_SWAP_ADDRESS
    const oldPattern = /export const PROXY_SWAP_ADDRESS = '[^']*';/;
    const newLine = `export const PROXY_SWAP_ADDRESS = '${contractAddress}';`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newLine);
      fs.writeFileSync(constantsPath, content, 'utf8');
      console.log("✅ constants.ts updated automatically");
    }
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
