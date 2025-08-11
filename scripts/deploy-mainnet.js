const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProxySwap to Ethereum Mainnet...");
  
  // Получаем деплойер
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  
  // Проверяем баланс
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.1")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.1 ETH");
    return;
  }

  // Деплоим SimpleProxySwap
  console.log("\n📦 Deploying SimpleProxySwap contract...");
  const SimpleProxySwap = await ethers.getContractFactory("SimpleProxySwap");
  
  // Оценка газа
  const estimatedGas = await ethers.provider.estimateGas({
    data: SimpleProxySwap.bytecode
  });
  console.log("⛽ Estimated gas:", estimatedGas.toString());
  
  const simpleProxySwap = await SimpleProxySwap.deploy();
  await simpleProxySwap.waitForDeployment();
  
  const address = await simpleProxySwap.getAddress();
  console.log("✅ SimpleProxySwap deployed to:", address);
  
  // Сохраняем адрес в файл
  const fs = require('fs');
  const deploymentInfo = {
    network: "mainnet",
    contractAddress: address,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: simpleProxySwap.deploymentTransaction()?.hash
  };
  
  fs.writeFileSync('mainnet-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to mainnet-deployment.json");
  
  console.log("\n🎉 Deployment completed!");
  console.log("📋 Next steps:");
  console.log("1. Update PROXY_SWAP_ADDRESS in src/app/utils/constants.ts");
  console.log("2. Fund the contract with ETH and tokens");
  console.log("3. Test the swap functionality");
  console.log("\n💡 To update constants.ts, use this address:");
  console.log(`export const PROXY_SWAP_ADDRESS = '${address}';`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
