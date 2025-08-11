// scripts/deploy-with-tokens.js

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying all contracts to ${network}...\n`);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // 1. Деплой мок токенов для локальной разработки
  let tokenAddresses = {};
  
  if (network === "hardhat" || network === "localhost") {
    console.log("\n📦 Deploying mock tokens...");
    
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    
    // Деплой USDC мок
    const mockUSDC = await MockERC20.deploy("Mock USD Coin", "USDC");
    await mockUSDC.deployed();
    console.log("✅ Mock USDC deployed at:", mockUSDC.address);
    
    // Деплой USDT мок
    const mockUSDT = await MockERC20.deploy("Mock Tether", "USDT");
    await mockUSDT.deployed();
    console.log("✅ Mock USDT deployed at:", mockUSDT.address);
    
    // Деплой WETH мок
    const mockWETH = await MockERC20.deploy("Mock Wrapped Ether", "WETH");
    await mockWETH.deployed();
    console.log("✅ Mock WETH deployed at:", mockWETH.address);
    
    // Минтим токены для тестирования (на deployer аккаунт)
    const mintAmount = ethers.utils.parseUnits("1000000", 6); // 1M токенов USDC/USDT
    const mintAmountWETH = ethers.utils.parseUnits("10000", 18); // 10K WETH
    
    await mockUSDC.mint(deployer.address, mintAmount);
    await mockUSDT.mint(deployer.address, mintAmount);
    await mockWETH.mint(deployer.address, mintAmountWETH);
    
    console.log(`💰 Minted 1,000,000 USDC to ${deployer.address}`);
    console.log(`💰 Minted 1,000,000 USDT to ${deployer.address}`);
    console.log(`💰 Minted 10,000 WETH to ${deployer.address}`);
    
    tokenAddresses = {
      USDC: mockUSDC.address,
      USDT: mockUSDT.address,
      WETH: mockWETH.address,
    };
  }

  // 2. Деплой MockRouter (если нужен)
  console.log("\n🔄 Deploying MockRouter...");
  const MockRouter = await ethers.getContractFactory("MockRouter");
  const mockRouter = await MockRouter.deploy();
  await mockRouter.deployed();
  console.log("✅ MockRouter deployed at:", mockRouter.address);

  // 3. Деплой ProxySwap
  console.log("\n💱 Deploying ProxySwap...");
  const ProxySwap = await ethers.getContractFactory("ProxySwap");
  const proxy = await ProxySwap.deploy(mockRouter.address);
  await proxy.deployed();
  console.log("✅ ProxySwap deployed at:", proxy.address);

  // 4. Выводим информацию для обновления констант
  console.log("\n📋 Contract Addresses Summary:");
  console.log("================================");
  console.log(`ProxySwap: ${proxy.address}`);
  console.log(`MockRouter: ${mockRouter.address}`);
  
  if (Object.keys(tokenAddresses).length > 0) {
    console.log("\nMock Tokens:");
    Object.entries(tokenAddresses).forEach(([symbol, address]) => {
      console.log(`${symbol}: ${address}`);
    });
  }

  // 5. Генерируем код для обновления constants.ts
  console.log("\n📝 Update your constants.ts with:");
  console.log("=================================");
  console.log(`export const PROXY_SWAP_ADDRESS = '${proxy.address}';`);
  console.log("");
  console.log("export const TokenMap = {");
  console.log("  ETH:  { address: '0x0000000000000000000000000000000000000000', decimals: 18 },");
  if (tokenAddresses.WETH) {
    console.log(`  WETH: { address: '${tokenAddresses.WETH}', decimals: 18 },`);
  }
  if (tokenAddresses.USDC) {
    console.log(`  USDC: { address: '${tokenAddresses.USDC}', decimals: 6 },`);
  }
  if (tokenAddresses.USDT) {
    console.log(`  USDT: { address: '${tokenAddresses.USDT}', decimals: 6 },`);
  }
  console.log("};");

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
