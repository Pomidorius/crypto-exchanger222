// scripts/check-balances.js

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking contract balances...\n");

  // Адреса из последнего деплоя
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const usdcAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const usdtAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const wethAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Подключаемся к провайдеру
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // ABI для ERC20
  const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  // Создаем контракты
  const usdc = new ethers.Contract(usdcAddress, erc20Abi, provider);
  const usdt = new ethers.Contract(usdtAddress, erc20Abi, provider);
  const weth = new ethers.Contract(wethAddress, erc20Abi, provider);

  // Проверяем балансы
  const usdcBalance = await usdc.balanceOf(contractAddress);
  const usdtBalance = await usdt.balanceOf(contractAddress);
  const wethBalance = await weth.balanceOf(contractAddress);
  const ethBalance = await provider.getBalance(contractAddress);

  console.log(`Contract: ${contractAddress}`);
  console.log("=====================================");
  console.log(`ETH:  ${ethers.utils.formatEther(ethBalance)} ETH`);
  console.log(`USDC: ${ethers.utils.formatUnits(usdcBalance, 6)} USDC`);
  console.log(`USDT: ${ethers.utils.formatUnits(usdtBalance, 6)} USDT`);
  console.log(`WETH: ${ethers.utils.formatEther(wethBalance)} WETH`);
  
  // Проверяем, достаточно ли для обмена 1 ETH -> 1998 USDT
  const requiredUSDT = ethers.utils.parseUnits("1998", 6);
  const hasEnoughUSDT = usdtBalance.gte(requiredUSDT);
  
  console.log("\n🧮 Exchange Check:");
  console.log(`Required for 1 ETH->USDT: 1998 USDT`);
  console.log(`Available: ${ethers.utils.formatUnits(usdtBalance, 6)} USDT`);
  console.log(`Sufficient: ${hasEnoughUSDT ? '✅ YES' : '❌ NO'}`);
}

main().catch(console.error);
