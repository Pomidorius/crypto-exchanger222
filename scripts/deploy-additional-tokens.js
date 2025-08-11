const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying additional tokens with account:", deployer.address);

  // Список новых токенов для деплоя
  const tokens = [
    { name: "Bitcoin", symbol: "BTC" },
    { name: "Binance Coin", symbol: "BNB" },
    { name: "Cardano", symbol: "ADA" },
    { name: "Polkadot", symbol: "DOT" },
    { name: "Chainlink", symbol: "LINK" },
    { name: "Uniswap", symbol: "UNI" },
    { name: "Polygon", symbol: "MATIC" },
    { name: "Avalanche", symbol: "AVAX" }
  ];

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  for (const token of tokens) {
    console.log(`\nDeploying ${token.symbol}...`);
    
    const contract = await MockERC20.deploy(
      token.name,
      token.symbol
    );
    
    await contract.deployed();
    console.log(`${token.symbol} deployed to:`, contract.address);
    
    // Минт токенов деплойеру
    const mintAmount = ethers.utils.parseEther("100000"); // 100k tokens
    await contract.mint(deployer.address, mintAmount);
    console.log(`Minted 100000 ${token.symbol} to deployer`);
  }
  
  console.log("\n✅ All additional tokens deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
