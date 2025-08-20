const { ethers } = require("hardhat");
require("dotenv/config");

async function checkDeploymentReadiness() {
  console.log("🔍 Checking deployment readiness for Sepolia...\n");
  
  // Проверяем наличие приватного ключа
  if (!process.env.DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY === "your_private_key_here") {
    console.log("❌ DEPLOYER_PRIVATE_KEY not set in .env file");
    console.log("📝 Steps to fix:");
    console.log("1. Get your MetaMask private key (Settings → Security & Privacy → Show Private Key)");
    console.log("2. Edit .env file and replace 'your_private_key_here' with your actual private key");
    console.log("3. Make sure your wallet has Sepolia ETH (get from https://sepoliafaucet.com/)");
    return false;
  }
  
  try {
    // Подключаемся к Sepolia
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a");
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    console.log("📍 Deployer address:", wallet.address);
    
    // Проверяем баланс
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("💰 Balance in Sepolia:", balanceInEth, "ETH");
    
    if (parseFloat(balanceInEth) < 0.01) {
      console.log("❌ Insufficient balance for deployment");
      console.log("📝 You need at least 0.01 ETH for gas fees");
      console.log("🚰 Get free Sepolia ETH from:");
      console.log("   • https://sepoliafaucet.com/");
      console.log("   • https://www.infura.io/faucet/sepolia");
      console.log("   • https://faucet.quicknode.com/ethereum/sepolia");
      return false;
    }
    
    // Проверяем сеть
    const network = await provider.getNetwork();
    console.log("🌐 Connected to network:", network.name, "Chain ID:", network.chainId.toString());
    
    if (network.chainId !== 11155111n) {
      console.log("❌ Wrong network! Expected Sepolia (11155111)");
      return false;
    }
    
    // Проверяем компиляцию контракта
    console.log("\n🔨 Checking contract compilation...");
    try {
      await hre.run("compile");
      console.log("✅ Contract compiled successfully");
    } catch (error) {
      console.log("❌ Contract compilation failed:", error.message);
      return false;
    }
    
    console.log("\n✅ Ready for deployment!");
    console.log("⏱️  Estimated deployment time: 1-3 minutes");
    console.log("💸 Estimated gas cost: 0.005-0.015 ETH");
    console.log("\n🚀 Run: npm run deploy:sepolia");
    
    return true;
    
  } catch (error) {
    console.log("❌ Connection failed:", error.message);
    console.log("📝 Check your RPC URL and private key");
    return false;
  }
}

checkDeploymentReadiness()
  .then(success => {
    if (success) {
      console.log("\n🎯 All checks passed! Ready to deploy.");
    } else {
      console.log("\n🔧 Please fix the issues above before deploying.");
    }
  })
  .catch(error => {
    console.error("❌ Check failed:", error);
  });
