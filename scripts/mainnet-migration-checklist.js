// scripts/mainnet-migration-checklist.js
const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * Чеклист для безопасного перехода на mainnet
 */
async function runMainnetChecklist() {
  console.log("🔍 ЧЕКЛИСТ ГОТОВНОСТИ К MAINNET");
  console.log("=".repeat(50));
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    items: []
  };
  
  // 1. Проверка сетевой конфигурации
  await checkNetworkConfig(results);
  
  // 2. Проверка RPC провайдеров
  await checkRPCProviders(results);
  
  // 3. Проверка безопасности приватных ключей
  await checkPrivateKeySecurity(results);
  
  // 4. Проверка контрактов
  await checkContracts(results);
  
  // 5. Проверка токенов
  await checkTokenConfiguration(results);
  
  // 6. Проверка мониторинга
  await checkMonitoring(results);
  
  // 7. Проверка фронтенда
  await checkFrontendConfig(results);
  
  // 8. Проверка безопасности
  await checkSecurityMeasures(results);
  
  // Выводим итоговый отчет
  printFinalReport(results);
  
  return results;
}

async function checkNetworkConfig(results) {
  console.log("\n📡 1. ПРОВЕРКА СЕТЕВОЙ КОНФИГУРАЦИИ");
  
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  
  if (chainId === '1') {
    addResult(results, '✅', 'NEXT_PUBLIC_CHAIN_ID установлен на mainnet (1)');
  } else {
    addResult(results, '❌', `NEXT_PUBLIC_CHAIN_ID = ${chainId}, должно быть 1 для mainnet`);
  }
  
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (rpcUrl && rpcUrl.includes('mainnet')) {
    addResult(results, '✅', 'RPC URL настроен для mainnet');
  } else {
    addResult(results, '❌', 'RPC URL не настроен для mainnet');
  }
}

async function checkRPCProviders(results) {
  console.log("\n🌐 2. ПРОВЕРКА RPC ПРОВАЙДЕРОВ");
  
  const providers = [
    { name: 'INFURA', env: 'NEXT_PUBLIC_RPC_URL' },
    { name: 'ALCHEMY', env: 'NEXT_PUBLIC_ALCHEMY_KEY' },
    { name: 'QUICKNODE', env: 'NEXT_PUBLIC_QUICKNODE_URL' }
  ];
  
  let activeProviders = 0;
  
  for (const provider of providers) {
    if (process.env[provider.env] && process.env[provider.env] !== 'your_key_here') {
      addResult(results, '✅', `${provider.name} провайдер настроен`);
      activeProviders++;
    } else {
      addResult(results, '⚠️', `${provider.name} провайдер не настроен`);
    }
  }
  
  if (activeProviders >= 2) {
    addResult(results, '✅', 'Есть резервные RPC провайдеры');
  } else {
    addResult(results, '❌', 'Нет резервных RPC провайдеров (рекомендуется минимум 2)');
  }
}

async function checkPrivateKeySecurity(results) {
  console.log("\n🔐 3. ПРОВЕРКА БЕЗОПАСНОСТИ ПРИВАТНЫХ КЛЮЧЕЙ");
  
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  const faucetKey = process.env.FAUCET_PRIVATE_KEY;
  
  if (!deployerKey || deployerKey === 'your_private_key_here') {
    addResult(results, '✅', 'DEPLOYER_PRIVATE_KEY не установлен (хорошо для mainnet)');
  } else {
    addResult(results, '❌', 'DEPLOYER_PRIVATE_KEY установлен! УДАЛИТЕ для mainnet!');
  }
  
  if (!faucetKey || faucetKey === 'your_faucet_private_key_here') {
    addResult(results, '✅', 'FAUCET_PRIVATE_KEY не установлен (правильно для mainnet)');
  } else {
    addResult(results, '❌', 'FAUCET_PRIVATE_KEY установлен! УДАЛИТЕ для mainnet!');
  }
  
  // Проверяем .env файлы
  const envFiles = ['.env', '.env.local', '.env.production'];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('private_key') && !content.includes('your_private_key_here')) {
        addResult(results, '❌', `Возможно есть приватные ключи в ${file}!`);
      }
    }
  }
}

async function checkContracts(results) {
  console.log("\n📜 4. ПРОВЕРКА КОНТРАКТОВ");
  
  const mainnetAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET;
  
  if (mainnetAddress && mainnetAddress !== '0x0000000000000000000000000000000000000001') {
    addResult(results, '✅', 'Адрес mainnet контракта установлен');
    
    // Проверяем что контракт существует
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const code = await provider.getCode(mainnetAddress);
      if (code !== '0x') {
        addResult(results, '✅', 'Контракт задеплоен и содержит код');
      } else {
        addResult(results, '❌', 'По указанному адресу нет контракта');
      }
    } catch (error) {
      addResult(results, '⚠️', 'Не удалось проверить контракт: ' + error.message);
    }
  } else {
    addResult(results, '❌', 'Адрес mainnet контракта не установлен');
  }
  
  // Проверяем что есть RealProxySwap.sol
  if (fs.existsSync('contracts/RealProxySwap.sol')) {
    addResult(results, '✅', 'RealProxySwap контракт найден');
  } else {
    addResult(results, '❌', 'RealProxySwap контракт не найден');
  }
}

async function checkTokenConfiguration(results) {
  console.log("\n🪙 5. ПРОВЕРКА КОНФИГУРАЦИИ ТОКЕНОВ");
  
  // Проверяем что используются реальные адреса токенов mainnet
  const constantsPath = 'src/app/utils/constants.ts';
  if (fs.existsSync(constantsPath)) {
    const content = fs.readFileSync(constantsPath, 'utf8');
    
    // Проверяем наличие реальных адресов mainnet токенов
    const mainnetTokens = [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    ];
    
    let foundTokens = 0;
    for (const tokenAddr of mainnetTokens) {
      if (content.includes(tokenAddr)) {
        foundTokens++;
      }
    }
    
    if (foundTokens >= 3) {
      addResult(results, '✅', 'Реальные адреса mainnet токенов настроены');
    } else {
      addResult(results, '❌', 'Не все адреса mainnet токенов настроены');
    }
  }
}

async function checkMonitoring(results) {
  console.log("\n📊 6. ПРОВЕРКА МОНИТОРИНГА");
  
  const monitoringServices = [
    { name: 'Sentry', env: 'NEXT_PUBLIC_SENTRY_DSN' },
    { name: 'Etherscan API', env: 'ETHERSCAN_API_KEY' },
    { name: 'Telegram Bot', env: 'TELEGRAM_BOT_TOKEN' },
  ];
  
  for (const service of monitoringServices) {
    if (process.env[service.env] && process.env[service.env] !== 'your_key_here') {
      addResult(results, '✅', `${service.name} настроен`);
    } else {
      addResult(results, '⚠️', `${service.name} не настроен`);
    }
  }
}

async function checkFrontendConfig(results) {
  console.log("\n🎨 7. ПРОВЕРКА КОНФИГУРАЦИИ ФРОНТЕНДА");
  
  // Проверяем что убраны демо-сообщения
  const componentFiles = [
    'src/app/components/TestFaucet.tsx',
    'src/app/components/ImprovedSwapForm.tsx'
  ];
  
  for (const file of componentFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('Демо') || content.includes('🎭')) {
        addResult(results, '⚠️', `${file} содержит демо-сообщения`);
      } else {
        addResult(results, '✅', `${file} готов для продакшена`);
      }
    }
  }
  
  // Проверяем vercel.json
  if (fs.existsSync('vercel.json')) {
    addResult(results, '✅', 'Конфигурация Vercel найдена');
  } else {
    addResult(results, '⚠️', 'Конфигурация Vercel не найдена');
  }
}

async function checkSecurityMeasures(results) {
  console.log("\n🛡️ 8. ПРОВЕРКА МER БЕЗОПАСНОСТИ");
  
  const securityFiles = [
    'SECURITY.md',
    'AUDIT_REPORT.md',
    'INCIDENT_RESPONSE.md'
  ];
  
  for (const file of securityFiles) {
    if (fs.existsSync(file)) {
      addResult(results, '✅', `${file} документ готов`);
    } else {
      addResult(results, '⚠️', `${file} документ отсутствует`);
    }
  }
  
  // Проверяем что есть тесты
  if (fs.existsSync('test/') && fs.readdirSync('test/').length > 0) {
    addResult(results, '✅', 'Тесты найдены');
  } else {
    addResult(results, '❌', 'Тесты не найдены');
  }
}

function addResult(results, status, message) {
  results.items.push({ status, message });
  console.log(`  ${status} ${message}`);
  
  if (status === '✅') results.passed++;
  else if (status === '❌') results.failed++;
  else if (status === '⚠️') results.warnings++;
}

function printFinalReport(results) {
  console.log("\n" + "=".repeat(60));
  console.log("📋 ИТОГОВЫЙ ОТЧЕТ ГОТОВНОСТИ К MAINNET");
  console.log("=".repeat(60));
  
  console.log(`✅ Пройдено: ${results.passed}`);
  console.log(`❌ Ошибок: ${results.failed}`);
  console.log(`⚠️  Предупреждений: ${results.warnings}`);
  
  const total = results.passed + results.failed + results.warnings;
  const score = (results.passed / total * 100).toFixed(1);
  
  console.log(`\n📊 Общий счет: ${score}%`);
  
  if (results.failed === 0 && results.warnings <= 2) {
    console.log("\n🎉 ГОТОВ К MAINNET! ✅");
    console.log("Все критические проверки пройдены.");
  } else if (results.failed === 0) {
    console.log("\n⚠️  ПОЧТИ ГОТОВ К MAINNET");
    console.log("Критических ошибок нет, но есть предупреждения.");
  } else {
    console.log("\n❌ НЕ ГОТОВ К MAINNET!");
    console.log("Необходимо исправить критические ошибки.");
  }
  
  if (results.failed > 0) {
    console.log("\n🔧 КРИТИЧЕСКИЕ ПРОБЛЕМЫ ДЛЯ ИСПРАВЛЕНИЯ:");
    results.items
      .filter(item => item.status === '❌')
      .forEach((item, index) => {
        console.log(`${index + 1}. ${item.message}`);
      });
  }
  
  console.log("\n📋 РЕКОМЕНДАЦИИ ПЕРЕД ЗАПУСКОМ:");
  console.log("1. Проведите финальное тестирование на Sepolia");
  console.log("2. Сделайте security аудит контрактов");
  console.log("3. Подготовьте план экстренного реагирования");
  console.log("4. Настройте мониторинг всех метрик");
  console.log("5. Подготовьте начальную ликвидность");
  console.log("6. Уведомите команду о запуске");
}

// Запускаем чеклист
if (require.main === module) {
  runMainnetChecklist()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Ошибка при выполнении чеклиста:", error);
      process.exit(1);
    });
}

module.exports = { runMainnetChecklist };
