const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Пополнение ProxySwap контракта ETH...");
  
  const PROXY_SWAP_ADDRESS = "0x01b44565F7Bb276E156023699225612887c63AC3";
  const [deployer] = await ethers.getSigners();
  
  console.log("🔑 Отправитель:", deployer.address);
  
  // Подключаемся к контракту
  const proxySwap = await ethers.getContractAt("ImprovedProxySwap", PROXY_SWAP_ADDRESS);
  
  // Пополняем контракт 0.05 ETH
  const fundAmount = ethers.utils.parseEther("0.05");
  console.log("💸 Пополняем контракт на 0.05 ETH...");
  
  const tx = await proxySwap.fundContract({ value: fundAmount });
  await tx.wait();
  
  console.log("✅ Контракт пополнен!");
  console.log("🔗 Транзакция:", tx.hash);
  
  // Проверяем баланс
  const balance = await proxySwap.getContractBalance("0x0000000000000000000000000000000000000000");
  console.log("💰 ETH баланс контракта:", ethers.utils.formatEther(balance));
  
  console.log("\n🎉 Готово! Теперь можно тестировать swaps!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
