const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Деплой тестовых токенов для ликвидности...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Деплоер:", deployer.address);
  
  // Получаем фабрику MockERC20
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  // Деплоим USDC
  console.log("\n💵 Деплой MockUSDC...");
  const mockUSDC = await MockERC20.deploy("Mock USD Coin", "USDC");
  await mockUSDC.deployed();
  const usdcAddress = mockUSDC.address;
  console.log("✅ MockUSDC развернут:", usdcAddress);
  
  // Деплоим USDT
  console.log("\n💶 Деплой MockUSDT...");
  const mockUSDT = await MockERC20.deploy("Mock Tether USD", "USDT");
  await mockUSDT.deployed();
  const usdtAddress = mockUSDT.address;
  console.log("✅ MockUSDT развернут:", usdtAddress);
  
  // Минтим токены для ликвидности
  const LIQUIDITY_AMOUNT = ethers.utils.parseUnits("1000000", 18); // 1M токенов с 18 decimals
  
  console.log("\n🪙 Минтинг токенов для ликвидности...");
  
  // Минтим USDC
  await mockUSDC.mint(deployer.address, LIQUIDITY_AMOUNT);
  console.log("✅ Создано 1,000,000 USDC");
  
  // Минтим USDT
  await mockUSDT.mint(deployer.address, LIQUIDITY_AMOUNT);
  console.log("✅ Создано 1,000,000 USDT");
  
  // Адрес ProxySwap контракта
  const PROXY_SWAP_ADDRESS = "0x01b44565F7Bb276E156023699225612887c63AC3";
  
  // Переводим токены в ProxySwap для ликвидности
  const TRANSFER_AMOUNT = ethers.utils.parseUnits("500000", 18); // 500k токенов
  
  console.log("\n🔄 Перевод токенов в ProxySwap контракт...");
  
  // Переводим USDC
  await mockUSDC.transfer(PROXY_SWAP_ADDRESS, TRANSFER_AMOUNT);
  console.log("✅ Переведено 500,000 USDC в ProxySwap");
  
  // Переводим USDT
  await mockUSDT.transfer(PROXY_SWAP_ADDRESS, TRANSFER_AMOUNT);
  console.log("✅ Переведено 500,000 USDT в ProxySwap");
  
  // Проверяем балансы
  console.log("\n📊 Балансы:");
  const deployerUSDC = await mockUSDC.balanceOf(deployer.address);
  const deployerUSDT = await mockUSDT.balanceOf(deployer.address);
  const contractUSDC = await mockUSDC.balanceOf(PROXY_SWAP_ADDRESS);
  const contractUSDT = await mockUSDT.balanceOf(PROXY_SWAP_ADDRESS);
  
  console.log("Деплоер USDC:", ethers.utils.formatUnits(deployerUSDC, 18));
  console.log("Деплоер USDT:", ethers.utils.formatUnits(deployerUSDT, 18));
  console.log("Контракт USDC:", ethers.utils.formatUnits(contractUSDC, 18));
  console.log("Контракт USDT:", ethers.utils.formatUnits(contractUSDT, 18));
  
  console.log("\n🎉 Деплой и настройка завершены!");
  console.log("\n📋 Адреса контрактов:");
  console.log("MockUSDC:", usdcAddress);
  console.log("MockUSDT:", usdtAddress);
  console.log("ProxySwap:", PROXY_SWAP_ADDRESS);
  
  // Сохраняем адреса в файл
  const deployment = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    contracts: {
      ProxySwap: PROXY_SWAP_ADDRESS,
      MockUSDC: usdcAddress,
      MockUSDT: usdtAddress
    },
    deployer: deployer.address
  };
  
  const fs = require('fs');
  fs.writeFileSync('mock-tokens-deployment.json', JSON.stringify(deployment, null, 2));
  console.log("📄 Адреса сохранены в mock-tokens-deployment.json");
  
  console.log("\n=== UPDATE CONSTANTS.TS ===");
  console.log(`'USDC': { address: '${usdcAddress}', decimals: 6, symbol: 'USDC' },`);
  console.log(`'USDT': { address: '${usdtAddress}', decimals: 6, symbol: 'USDT' }`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
