const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Генерация приватного ключа из seed фразы...");
  
  const mnemonic = "critic evidence fault remain move idea park forward pipe man thunder nature";
  
  try {
    // Создаем HD кошелек из мнемоники (ethers v5)
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    
    console.log("✅ Кошелек создан!");
    console.log("📍 Адрес:", wallet.address);
    console.log("🔐 Приватный ключ:", wallet.privateKey);
    
    // Проверяем баланс на Sepolia
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a"
    );
    
    const connectedWallet = wallet.connect(provider);
    const balance = await connectedWallet.provider.getBalance(wallet.address);
    
    console.log("💰 Баланс на Sepolia:", ethers.formatEther(balance), "ETH");
    
    if (balance > 0) {
      console.log("✅ У адреса есть ETH для деплоя!");
    } else {
      console.log("❌ Нужно получить ETH через faucet");
      console.log("🚰 Faucet: https://sepolia-faucet.pk910.de/");
    }
    
    console.log("\n📋 Добавьте в .env файл:");
    console.log(`DEPLOYER_PRIVATE_KEY=${wallet.privateKey.slice(2)}`);
    
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
