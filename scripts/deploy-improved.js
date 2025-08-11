const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ImprovedProxySwap with fee management...");
  
  // Получаем деплойер
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  
  // Проверяем баланс
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.05")) {
    console.warn("⚠️  Low balance! Consider adding more ETH for gas fees");
  }

  // Деплоим ImprovedProxySwap
  console.log("\n📦 Deploying ImprovedProxySwap contract...");
  const ImprovedProxySwap = await ethers.getContractFactory("ImprovedProxySwap");
  
  const improvedProxySwap = await ImprovedProxySwap.deploy();
  await improvedProxySwap.waitForDeployment();
  
  const address = await improvedProxySwap.getAddress();
  console.log("✅ ImprovedProxySwap deployed to:", address);
  
  // Устанавливаем базовые курсы обмена для тестирования
  console.log("\n🔧 Setting up basic exchange rates...");
  
  const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  
  // Примерные курсы (можно настроить позже)
  // 1 ETH = 2500 USDC/USDT (учитываем decimals)
  const ETH_TO_USDC = ethers.parseUnits("2500", 6); // USDC has 6 decimals
  const ETH_TO_USDT = ethers.parseUnits("2500", 6); // USDT has 6 decimals
  const ETH_TO_WETH = ethers.parseEther("1"); // 1:1 rate
  
  try {
    // ETH -> Tokens
    await improvedProxySwap.setExchangeRate(ETH_ADDRESS, USDC_ADDRESS, ETH_TO_USDC);
    console.log("📈 Set ETH -> USDC rate");
    
    await improvedProxySwap.setExchangeRate(ETH_ADDRESS, USDT_ADDRESS, ETH_TO_USDT);
    console.log("📈 Set ETH -> USDT rate");
    
    await improvedProxySwap.setExchangeRate(ETH_ADDRESS, WETH_ADDRESS, ETH_TO_WETH);
    console.log("📈 Set ETH -> WETH rate");
    
    // Обратные курсы (Tokens -> ETH)
    const USDC_TO_ETH = ethers.parseEther("0.0004"); // 1 USDC = 0.0004 ETH
    const USDT_TO_ETH = ethers.parseEther("0.0004"); // 1 USDT = 0.0004 ETH
    
    await improvedProxySwap.setExchangeRate(USDC_ADDRESS, ETH_ADDRESS, USDC_TO_ETH);
    console.log("📈 Set USDC -> ETH rate");
    
    await improvedProxySwap.setExchangeRate(USDT_ADDRESS, ETH_ADDRESS, USDT_TO_ETH);
    console.log("📈 Set USDT -> ETH rate");
    
    await improvedProxySwap.setExchangeRate(WETH_ADDRESS, ETH_ADDRESS, ETH_TO_WETH);
    console.log("📈 Set WETH -> ETH rate");
    
  } catch (error) {
    console.log("⚠️  Exchange rates setup failed (can be set later):", error.message);
  }
  
  // Сохраняем информацию о деплойменте
  const fs = require('fs');
  const deploymentInfo = {
    network: process.env.NEXT_PUBLIC_CHAIN_ID === "1" ? "mainnet" : "localhost",
    contractAddress: address,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: improvedProxySwap.deploymentTransaction()?.hash,
    contractType: "ImprovedProxySwap",
    features: [
      "Fee accumulation and withdrawal",
      "Reentrancy protection", 
      "Access control",
      "Emergency functions",
      "Event logging"
    ]
  };
  
  const filename = process.env.NEXT_PUBLIC_CHAIN_ID === "1" 
    ? 'mainnet-deployment.json' 
    : 'localhost-deployment.json';
    
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to ${filename}`);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n💡 CONTRACT FEATURES:");
  console.log("• 0.1% fee on all swaps");
  console.log("• Fees accumulate in contract");
  console.log("• Owner can withdraw fees anytime");
  console.log("• Reentrancy protection");
  console.log("• Emergency withdraw functions");
  
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Update PROXY_SWAP_ADDRESS in constants.ts");
  console.log("2. Fund contract with ETH and tokens");
  console.log("3. Test swaps with small amounts");
  console.log("4. Withdraw accumulated fees when needed");
  
  console.log("\n💰 FEE MANAGEMENT:");
  console.log(`• Check ETH fees: contract.getAccumulatedFees("0x0000000000000000000000000000000000000000")`);
  console.log(`• Check token fees: contract.getAccumulatedFees("TOKEN_ADDRESS")`);
  console.log(`• Withdraw fees: contract.withdrawFees("TOKEN_ADDRESS", "YOUR_ADDRESS")`);
  
  console.log(`\n📝 To update constants.ts:`);
  console.log(`export const PROXY_SWAP_ADDRESS = '${address}';`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
