import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Mock ERC20 tokens to Sepolia...");

  // Получаем deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Деплоим USDC
  const MockUSDC = await ethers.getContractFactory("MockERC20");
  const usdc = await MockUSDC.deploy("Test USDC", "USDC");
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // Деплоим USDT
  const MockUSDT = await ethers.getContractFactory("MockERC20");
  const usdt = await MockUSDT.deploy("Test USDT", "USDT");
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT deployed to:", usdtAddress);

  // Сохраняем адреса
  const deployment = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      USDC: usdcAddress,
      USDT: usdtAddress
    }
  };

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log(JSON.stringify(deployment, null, 2));
  
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
