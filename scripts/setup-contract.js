const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Настройка ImprovedProxySwap контракта...");
  
  // Адрес развернутого контракта
  const PROXY_SWAP_ADDRESS = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
  
  // Адреса токенов на Sepolia
  const TOKENS = {
    ETH: "0x0000000000000000000000000000000000000000", // Native ETH
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
    USDT: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9", // Sepolia USDT  
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"  // Sepolia WETH
  };
  
  // Exchange rates (примерные курсы)
  const RATES = {
    // ETH -> USDC (1 ETH = ~3000 USDC)
    ETH_TO_USDC: ethers.parseUnits("3000", 6), // 6 decimals для USDC
    // ETH -> USDT (1 ETH = ~3000 USDT)  
    ETH_TO_USDT: ethers.parseUnits("3000", 6), // 6 decimals для USDT
    // USDC -> ETH (1 USDC = ~0.00033 ETH)
    USDC_TO_ETH: ethers.parseUnits("0.00033", 18),
    // USDT -> ETH (1 USDT = ~0.00033 ETH)
    USDT_TO_ETH: ethers.parseUnits("0.00033", 18)
  };
  
  // Подключаемся к контракту
  const [signer] = await ethers.getSigners();
  console.log("🔑 Используем адрес:", signer.address);
  
  const proxySwap = await ethers.getContractAt("ImprovedProxySwap", PROXY_SWAP_ADDRESS, signer);
  
  try {
    // Проверяем владельца контракта
    const owner = await proxySwap.owner();
    console.log("👑 Владелец контракта:", owner);
    console.log("🔑 Текущий адрес:", signer.address);
    
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.log("❌ Вы не владелец контракта! Нужен адрес:", owner);
      return;
    }
    
    console.log("✅ Вы владелец контракта! Настраиваем exchange rates...");
    
    // Настраиваем exchange rates
    console.log("\n📊 Настройка курсов обмена:");
    
    // ETH -> USDC
    console.log("🔄 ETH -> USDC...");
    const tx1 = await proxySwap.setExchangeRate(TOKENS.ETH, TOKENS.USDC, RATES.ETH_TO_USDC);
    await tx1.wait();
    console.log("✅ ETH -> USDC установлен");
    
    // ETH -> USDT
    console.log("🔄 ETH -> USDT...");
    const tx2 = await proxySwap.setExchangeRate(TOKENS.ETH, TOKENS.USDT, RATES.ETH_TO_USDT);
    await tx2.wait();
    console.log("✅ ETH -> USDT установлен");
    
    // USDC -> ETH
    console.log("🔄 USDC -> ETH...");
    const tx3 = await proxySwap.setExchangeRate(TOKENS.USDC, TOKENS.ETH, RATES.USDC_TO_ETH);
    await tx3.wait();
    console.log("✅ USDC -> ETH установлен");
    
    // USDT -> ETH
    console.log("🔄 USDT -> ETH...");
    const tx4 = await proxySwap.setExchangeRate(TOKENS.USDT, TOKENS.ETH, RATES.USDT_TO_ETH);
    await tx4.wait();
    console.log("✅ USDT -> ETH установлен");
    
    // Проверяем установленные курсы
    console.log("\n🔍 Проверка установленных курсов:");
    const ethToUsdc = await proxySwap.exchangeRates(TOKENS.ETH, TOKENS.USDC);
    const ethToUsdt = await proxySwap.exchangeRates(TOKENS.ETH, TOKENS.USDT);
    console.log("ETH -> USDC:", ethers.formatUnits(ethToUsdc, 6));
    console.log("ETH -> USDT:", ethers.formatUnits(ethToUsdt, 6));
    
    // Пополняем контракт токенами для ликвидности
    console.log("\n💰 Информация о ликвидности:");
    const ethBalance = await proxySwap.getContractBalance(TOKENS.ETH);
    const usdcBalance = await proxySwap.getContractBalance(TOKENS.USDC);
    const usdtBalance = await proxySwap.getContractBalance(TOKENS.USDT);
    
    console.log("ETH баланс контракта:", ethers.formatEther(ethBalance));
    console.log("USDC баланс контракта:", ethers.formatUnits(usdcBalance, 6));
    console.log("USDT баланс контракта:", ethers.formatUnits(usdtBalance, 6));
    
    // Пополняем контракт ETH для ликвидности
    if (ethBalance < ethers.parseEther("0.1")) {
      console.log("\n💸 Пополняем контракт ETH...");
      const fundTx = await proxySwap.fundContract({ value: ethers.parseEther("0.1") });
      await fundTx.wait();
      console.log("✅ Контракт пополнен на 0.1 ETH");
    }
    
    console.log("\n🎉 Настройка контракта завершена!");
    console.log("🔗 Контракт готов к использованию:");
    console.log(`   https://sepolia.etherscan.io/address/${PROXY_SWAP_ADDRESS}`);
    
  } catch (error) {
    console.error("❌ Ошибка при настройке:", error.message);
    
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("\n💡 Решение: Используйте адрес владельца контракта");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
