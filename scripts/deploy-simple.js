// scripts/deploy-simple.js

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying SimpleProxySwap to ${network}...\n`);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // 1. Деплой мок токенов
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

  // 2. Деплой SimpleProxySwap
  console.log("\n💱 Deploying SimpleProxySwap...");
  const SimpleProxySwap = await ethers.getContractFactory("SimpleProxySwap");
  const proxy = await SimpleProxySwap.deploy();
  await proxy.deployed();
  console.log("✅ SimpleProxySwap deployed at:", proxy.address);

  // 3. Минтим токены на контракт и деплоера
  console.log("\n💰 Minting tokens...");
  
  const mintToContract = ethers.utils.parseUnits("1000000000", 6); // 1B токенов на контракт
  const mintToDeployer = ethers.utils.parseUnits("100000", 6);     // 100K токенов деплоеру
  const mintWETH = ethers.utils.parseUnits("100000", 18);          // 100K WETH

  // Минтим на контракт (для выплат)
  await mockUSDC.mint(proxy.address, mintToContract);
  await mockUSDT.mint(proxy.address, mintToContract);
  await mockWETH.mint(proxy.address, ethers.utils.parseUnits("100000", 18));
  
  // Минтим деплоеру (для тестирования)
  await mockUSDC.mint(deployer.address, mintToDeployer);
  await mockUSDT.mint(deployer.address, mintToDeployer);
  await mockWETH.mint(deployer.address, mintWETH);

  console.log("💰 Minted tokens to contract and deployer");

  // 4. Пополняем контракт ETH
  console.log("\n💳 Funding contract with ETH...");
  await deployer.sendTransaction({
    to: proxy.address,
    value: ethers.utils.parseEther("100") // 100 ETH для выплат
  });
  console.log("💰 Funded contract with 100 ETH");

  // 5. Устанавливаем курсы обмена
  console.log("\n📊 Setting exchange rates...");
  
  const ethAddress = "0x0000000000000000000000000000000000000000";
  
  // ETH -> токены 
  // 1 ETH = 2000 USDC (6 decimals) -> rate = 2000 * 10^6 = 2000000000
  // 1 ETH = 2000 USDT (6 decimals) -> rate = 2000 * 10^6 = 2000000000
  // 1 ETH = 1 WETH (18 decimals) -> rate = 1 * 10^18
  await proxy.setExchangeRate(ethAddress, mockUSDC.address, "2000000000"); // 2000 USDC
  await proxy.setExchangeRate(ethAddress, mockUSDT.address, "2000000000"); // 2000 USDT
  await proxy.setExchangeRate(ethAddress, mockWETH.address, ethers.utils.parseEther("1")); // 1 WETH
  
  // Токены -> ETH
  // 2000 USDC = 1 ETH -> rate = 1 * 10^18 / 2000 = 500000000000000
  // 2000 USDT = 1 ETH -> rate = 1 * 10^18 / 2000 = 500000000000000
  // 1 WETH = 1 ETH -> rate = 1 * 10^18
  await proxy.setExchangeRate(mockUSDC.address, ethAddress, "500000000000000"); // 0.0005 ETH per USDC
  await proxy.setExchangeRate(mockUSDT.address, ethAddress, "500000000000000"); // 0.0005 ETH per USDT
  await proxy.setExchangeRate(mockWETH.address, ethAddress, ethers.utils.parseEther("1")); // 1 ETH per WETH
  
  // Токен -> токен (1:1 для стейблкоинов)
  await proxy.setExchangeRate(mockUSDC.address, mockUSDT.address, "1000000"); // 1 USDT per USDC
  await proxy.setExchangeRate(mockUSDT.address, mockUSDC.address, "1000000"); // 1 USDC per USDT
  
  console.log("✅ Exchange rates set successfully");

  // 6. Выводим итоговую информацию
  console.log("\n📋 Contract Addresses Summary:");
  console.log("================================");
  console.log(`SimpleProxySwap: ${proxy.address}`);
  console.log(`Mock USDC: ${mockUSDC.address}`);
  console.log(`Mock USDT: ${mockUSDT.address}`);
  console.log(`Mock WETH: ${mockWETH.address}`);

  console.log("\n📝 Update your constants.ts with:");
  console.log("=================================");
  console.log(`export const PROXY_SWAP_ADDRESS = '${proxy.address}';`);
  console.log("");
  console.log("export const TokenMap = {");
  console.log("  ETH:  { address: '0x0000000000000000000000000000000000000000', decimals: 18 },");
  console.log(`  WETH: { address: '${mockWETH.address}', decimals: 18 },`);
  console.log(`  USDC: { address: '${mockUSDC.address}', decimals: 6 },`);
  console.log(`  USDT: { address: '${mockUSDT.address}', decimals: 6 },`);
  console.log("};");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("💡 Contract is funded and ready for testing!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
