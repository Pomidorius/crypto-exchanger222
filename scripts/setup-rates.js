// scripts/setup-rates.js
// Устанавливает курсы обмена для всех пар токенов

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Setting up exchange rates...");

  // Адреса контрактов (обновите при необходимости)
  const PROXY_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const USDC_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const USDT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const WETH_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Подключаемся к контракту
  const SimpleProxySwap = await ethers.getContractFactory("SimpleProxySwap");
  const proxy = SimpleProxySwap.attach(PROXY_ADDRESS);

  console.log("📊 Setting exchange rates...");

  try {
    // ETH -> токены 
    console.log("Setting ETH -> Token rates...");
    await proxy.setExchangeRate(ETH_ADDRESS, USDC_ADDRESS, "2000000000"); // 1 ETH = 2000 USDC
    await proxy.setExchangeRate(ETH_ADDRESS, USDT_ADDRESS, "2000000000"); // 1 ETH = 2000 USDT
    await proxy.setExchangeRate(ETH_ADDRESS, WETH_ADDRESS, ethers.utils.parseEther("1")); // 1 ETH = 1 WETH

    // Токены -> ETH
    console.log("Setting Token -> ETH rates...");
    await proxy.setExchangeRate(USDC_ADDRESS, ETH_ADDRESS, "500000000000000"); // 2000 USDC = 1 ETH
    await proxy.setExchangeRate(USDT_ADDRESS, ETH_ADDRESS, "500000000000000"); // 2000 USDT = 1 ETH
    await proxy.setExchangeRate(WETH_ADDRESS, ETH_ADDRESS, ethers.utils.parseEther("1")); // 1 WETH = 1 ETH

    // Токен -> токен
    console.log("Setting Token -> Token rates...");
    await proxy.setExchangeRate(USDC_ADDRESS, USDT_ADDRESS, "1000000"); // 1 USDC = 1 USDT
    await proxy.setExchangeRate(USDT_ADDRESS, USDC_ADDRESS, "1000000"); // 1 USDT = 1 USDC
    
    // WETH <-> Stablecoins
    await proxy.setExchangeRate(WETH_ADDRESS, USDC_ADDRESS, "2000000000"); // 1 WETH = 2000 USDC
    await proxy.setExchangeRate(WETH_ADDRESS, USDT_ADDRESS, "2000000000"); // 1 WETH = 2000 USDT
    await proxy.setExchangeRate(USDC_ADDRESS, WETH_ADDRESS, ethers.utils.parseEther("0.0005")); // 2000 USDC = 1 WETH
    await proxy.setExchangeRate(USDT_ADDRESS, WETH_ADDRESS, ethers.utils.parseEther("0.0005")); // 2000 USDT = 1 WETH

    console.log("✅ All exchange rates set successfully!");

    // Проверим один из курсов
    console.log("\n🔍 Verifying rates...");
    const rate = await proxy.exchangeRates(ETH_ADDRESS, USDC_ADDRESS);
    console.log(`ETH -> USDC rate: ${rate.toString()}`);

  } catch (error) {
    console.error("❌ Error setting rates:", error.message);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
