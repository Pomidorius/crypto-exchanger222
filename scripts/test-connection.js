const { ethers } = require("hardhat");

async function testConnection() {
  console.log("🔍 Testing Hardhat connection...");
  
  try {
    // Проверяем подключение
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
    
    console.log("✅ Connection successful!");
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

testConnection();
