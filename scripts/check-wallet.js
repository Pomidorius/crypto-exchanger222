const { ethers } = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("🔍 Checking wallet balance for mainnet deployment...");
  
  try {
    // Получаем приватный ключ из .env.local
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error("❌ DEPLOYER_PRIVATE_KEY not found in .env.local");
      console.log("💡 Please add your private key to .env.local:");
      console.log("DEPLOYER_PRIVATE_KEY=0xYourPrivateKeyHere");
      return;
    }
    
    if (privateKey === "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") {
      console.error("❌ You're using the default test private key!");
      console.log("🚨 This key has no ETH on mainnet and should NEVER be used for real deployments");
      console.log("💡 Please replace with your real private key that has ETH");
      return;
    }
    
    // Подключаемся к mainnet
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("📍 Wallet address:", wallet.address);
    
    // Проверяем баланс
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("💰 Current balance:", balanceInEth, "ETH");
    
    // Проверяем достаточно ли средств
    const minRequired = 0.05;
    if (parseFloat(balanceInEth) < minRequired) {
      console.error(`❌ Insufficient balance! Need at least ${minRequired} ETH for deployment`);
      console.log("💡 Please add more ETH to this address before deploying");
      return;
    }
    
    console.log("✅ Balance is sufficient for deployment");
    console.log("\n🚀 Ready to deploy! Run:");
    console.log("npm run mainnet:deploy-improved  # for ImprovedProxySwap with fees");
    console.log("npm run mainnet:deploy          # for standard ProxySwap");
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    
    if (error.message.includes("invalid private key")) {
      console.log("💡 Please check your private key format in .env.local");
      console.log("Should be: DEPLOYER_PRIVATE_KEY=0x...");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
