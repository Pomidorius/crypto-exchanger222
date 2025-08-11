const { ethers } = require("hardhat");

async function main() {
  console.log("Setting up exchange rates for all tokens...");

  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const SimpleProxySwap = await ethers.getContractFactory("SimpleProxySwap");
  const contract = SimpleProxySwap.attach(contractAddress);

  // Адреса токенов
  const tokens = {
    WETH: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    USDC: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", 
    USDT: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    BTC: "0x851356ae760d987E095750cCeb3bC6014560891C",
    BNB: "0x95401dc811bb5740090279Ba06cfA8fcF6113778",
    ADA: "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
    DOT: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
    LINK: "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf",
    UNI: "0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00",
    MATIC: "0x809d550fca64d94Bd9F66E60752A544199cfAC3D",
    AVAX: "0x1291Be112d480055DaFd8a610b7d1e203891C274"
  };

  // Курсы в USD (примерные)
  const rates = {
    WETH: ethers.utils.parseEther("3500"),   // $3500
    USDC: ethers.utils.parseEther("1"),      // $1
    USDT: ethers.utils.parseEther("1"),      // $1  
    BTC: ethers.utils.parseEther("65000"),   // $65000
    BNB: ethers.utils.parseEther("600"),     // $600
    ADA: ethers.utils.parseEther("0.5"),     // $0.5
    DOT: ethers.utils.parseEther("7"),       // $7
    LINK: ethers.utils.parseEther("15"),     // $15
    UNI: ethers.utils.parseEther("8"),       // $8
    MATIC: ethers.utils.parseEther("0.9"),   // $0.9
    AVAX: ethers.utils.parseEther("35")      // $35
  };

  console.log("Setting exchange rates...");
  
  // Устанавливаем курсы для всех пар
  const tokenSymbols = Object.keys(tokens);
  
  for (let i = 0; i < tokenSymbols.length; i++) {
    for (let j = 0; j < tokenSymbols.length; j++) {
      if (i !== j) {
        const symbolIn = tokenSymbols[i];
        const symbolOut = tokenSymbols[j];
        const addressIn = tokens[symbolIn];
        const addressOut = tokens[symbolOut];
        
        // Вычисляем курс как отношение цен
        const rateInUSD = parseFloat(ethers.utils.formatEther(rates[symbolIn]));
        const rateOutUSD = parseFloat(ethers.utils.formatEther(rates[symbolOut]));
        const exchangeRate = (rateInUSD / rateOutUSD).toFixed(6);
        
        try {
          console.log(`Setting rate ${symbolIn} -> ${symbolOut}: ${exchangeRate}`);
          await contract.setExchangeRate(
            addressIn, 
            addressOut, 
            ethers.utils.parseEther(exchangeRate)
          );
        } catch (error) {
          console.error(`❌ Error setting ${symbolIn}->${symbolOut}:`, error.message);
        }
      }
    }
  }

  console.log("\n🎉 All exchange rates set successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
