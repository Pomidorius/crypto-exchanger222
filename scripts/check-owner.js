const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Проверка владельца контракта...");
  
  const PROXY_SWAP_ADDRESS = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
  
  try {
    // Используем Hardhat provider
    const proxySwap = await ethers.getContractAt("ImprovedProxySwap", PROXY_SWAP_ADDRESS);
    
    const owner = await proxySwap.owner();
    console.log("👑 Владелец контракта:", owner);
    
    // Проверяем известные адреса
    const knownAddresses = {
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": "Hardhat тестовый адрес #0",
      "0xF1BC2b8b3269fc585fC4f63Ff49ED279a5a55C82": "Ваш новый адрес"
    };
    
    if (knownAddresses[owner]) {
      console.log("✅ Это известный адрес:", knownAddresses[owner]);
    } else {
      console.log("❓ Неизвестный адрес владельца");
    }
    
    // Проверяем баланс контракта
    const ethBalance = await proxySwap.getContractBalance("0x0000000000000000000000000000000000000000");
    console.log("💰 ETH баланс контракта:", ethers.formatEther(ethBalance));
    
    console.log("\n📋 Для настройки контракта нужен приватный ключ владельца:");
    console.log("   Владелец:", owner);
    
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
