// scripts/check-balances.js

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking contract balances...\n");

  // Адреса из последнего деплоя
  const contractAddress = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
  const usdcAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
  const usdtAddress = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";
  const wethAddress = "0x59b670e9fA9D0A427751Af201D676719a970857b";

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
