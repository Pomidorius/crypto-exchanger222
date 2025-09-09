// scripts/deploy-mainnet-real.js
const { ethers } = require("hardhat");
const fs = require('fs');

// Адреса Uniswap V3 на mainnet
const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const UNISWAP_V3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

// Поддерживаемые токены на mainnet
const SUPPORTED_TOKENS = [
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
];

async function main() {
  console.log("🚀 Начинаем деплой RealProxySwap на Ethereum Mainnet...");
  
  // Проверяем сеть
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 1) {
    throw new Error(`❌ Неправильная сеть! Ожидается mainnet (1), получено ${network.chainId}`);
  }
  
  console.log(`✅ Подключены к сети: ${network.name} (chainId: ${network.chainId})`);
  
  // Получаем deployer
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer адрес: ${deployer.address}`);
  
  // Проверяем баланс
  const balance = await deployer.getBalance();
  console.log(`💰 Баланс deployer'а: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.lt(ethers.utils.parseEther("0.5"))) {
    throw new Error("❌ Недостаточно ETH для деплоя (минимум 0.5 ETH)");
  }
  
  // Получаем текущую цену газа
  const gasPrice = await ethers.provider.getGasPrice();
  console.log(`⛽ Текущая цена газа: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
  
  // Предупреждение о высокой цене газа
  const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
  if (gasPriceGwei > 50) {
    console.log(`⚠️  ВНИМАНИЕ: Высокая цена газа (${gasPriceGwei} gwei)! Рекомендуется подождать.`);
    
    // В продакшене здесь можно добавить интерактивное подтверждение
    // const readline = require('readline');
    // const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // const answer = await new Promise(resolve => rl.question('Продолжить? (y/n): ', resolve));
    // if (answer.toLowerCase() !== 'y') process.exit(0);
  }
  
  console.log("📦 Компилируем контракт...");
  
  // Деплоим RealProxySwap
  const RealProxySwap = await ethers.getContractFactory("RealProxySwap");
  
  console.log("🚀 Деплоим RealProxySwap контракт...");
  console.log(`   Router: ${UNISWAP_V3_ROUTER}`);
  console.log(`   Quoter: ${UNISWAP_V3_QUOTER}`);
  
  const realProxySwap = await RealProxySwap.deploy(
    UNISWAP_V3_ROUTER,
    UNISWAP_V3_QUOTER,
    {
      gasPrice: gasPrice,
      gasLimit: 3000000 // Увеличиваем лимит газа для сложного контракта
    }
  );
  
  console.log("⏳ Ожидаем деплоя контракта...");
  await realProxySwap.deployed();
  
  console.log(`✅ RealProxySwap задеплоен по адресу: ${realProxySwap.address}`);
  console.log(`🔗 Etherscan: https://etherscan.io/address/${realProxySwap.address}`);
  
  // Ждем несколько блоков для стабильности
  console.log("⏳ Ожидаем подтверждения блоков...");
  await realProxySwap.deployTransaction.wait(5);
  
  console.log("🔧 Настраиваем поддерживаемые токены...");
  
  // Добавляем поддерживаемые токены
  for (const tokenAddress of SUPPORTED_TOKENS) {
    try {
      console.log(`   Добавляем токен: ${tokenAddress}`);
      const tx = await realProxySwap.setSupportedToken(tokenAddress, true, {
        gasPrice: gasPrice
      });
      await tx.wait(2);
      console.log(`   ✅ Токен ${tokenAddress} добавлен`);
    } catch (error) {
      console.error(`   ❌ Ошибка добавления токена ${tokenAddress}:`, error.message);
    }
  }
  
  // Устанавливаем разумные лимиты для mainnet
  console.log("💰 Устанавливаем лимиты свапа...");
  const minSwapAmount = ethers.utils.parseEther("0.01"); // 0.01 ETH минимум
  const maxSwapAmount = ethers.utils.parseEther("50");   // 50 ETH максимум
  
  const limitsResponse = await realProxySwap.setSwapLimits(minSwapAmount, maxSwapAmount, {
    gasPrice: gasPrice
  });
  await limitsResponse.wait(2);
  console.log(`✅ Лимиты установлены: ${ethers.utils.formatEther(minSwapAmount)} - ${ethers.utils.formatEther(maxSwapAmount)} ETH`);
  
  // Сохраняем информацию о деплое
  const deploymentInfo = {
    network: "mainnet",
    chainId: network.chainId,
    contractAddress: realProxySwap.address,
    deployerAddress: deployer.address,
    deploymentTxHash: realProxySwap.deployTransaction.hash,
    blockNumber: realProxySwap.deployTransaction.blockNumber,
    gasPrice: gasPrice.toString(),
    timestamp: new Date().toISOString(),
    supportedTokens: SUPPORTED_TOKENS,
    swapLimits: {
      min: minSwapAmount.toString(),
      max: maxSwapAmount.toString()
    },
    uniswapRouter: UNISWAP_V3_ROUTER,
    uniswapQuoter: UNISWAP_V3_QUOTER,
    etherscanUrl: `https://etherscan.io/address/${realProxySwap.address}`
  };
  
  // Сохраняем в файл
  const deploymentFile = 'mainnet-deployment.json';
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Информация о деплое сохранена в ${deploymentFile}`);
  
  // Обновляем константы в коде
  console.log("🔄 Обновляем конфигурацию...");
  try {
    updateConstants(realProxySwap.address);
    console.log("✅ Константы обновлены");
  } catch (error) {
    console.error("❌ Ошибка обновления констант:", error.message);
  }
  
  console.log("\n🎉 ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!");
  console.log("=".repeat(50));
  console.log(`📍 Адрес контракта: ${realProxySwap.address}`);
  console.log(`🔗 Etherscan: https://etherscan.io/address/${realProxySwap.address}`);
  console.log(`💰 Потрачено ETH: ~${ethers.utils.formatEther(gasPrice.mul(3000000))} ETH`);
  console.log("=".repeat(50));
  
  console.log("\n📋 СЛЕДУЮЩИЕ ШАГИ:");
  console.log("1. ✅ Обновить NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET в .env");
  console.log("2. ✅ Верифицировать контракт на Etherscan");
  console.log("3. ✅ Провести тестирование на небольших суммах");
  console.log("4. ✅ Настроить мониторинг и алерты");
  console.log("5. ✅ Подготовить начальную ликвидность");
  console.log("6. ✅ Провести security аудит");
  console.log("7. ✅ Настроить multisig для управления контрактом");
  
  console.log("\n⚠️  ВАЖНО:");
  console.log("- Сохраните приватный ключ deployer'а в безопасном месте");
  console.log("- Переведите ownership контракта на multisig кошелек");
  console.log("- Настройте мониторинг всех транзакций");
  console.log("- Подготовьте план экстренного реагирования");
}

/**
 * Обновляет константы в коде
 */
function updateConstants(contractAddress) {
  const constantsPath = 'src/app/utils/constants.ts';
  
  if (!fs.existsSync(constantsPath)) {
    throw new Error(`Файл констант не найден: ${constantsPath}`);
  }
  
  let content = fs.readFileSync(constantsPath, 'utf8');
  
  // Обновляем адрес контракта для mainnet
  content = content.replace(
    /NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET.*?'0x[a-fA-F0-9]{40}'/,
    `NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || '${contractAddress}'`
  );
  
  fs.writeFileSync(constantsPath, content);
}

// Обработка ошибок
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ОШИБКА ДЕПЛОЯ:");
    console.error(error);
    
    if (error.message.includes('insufficient funds')) {
      console.error("\n💡 РЕШЕНИЕ: Пополните баланс deployer'а");
    } else if (error.message.includes('gas')) {
      console.error("\n💡 РЕШЕНИЕ: Попробуйте увеличить gas limit или дождитесь снижения цены газа");
    } else if (error.message.includes('nonce')) {
      console.error("\n💡 РЕШЕНИЕ: Проверьте nonce транзакций");
    }
    
    process.exit(1);
  });
