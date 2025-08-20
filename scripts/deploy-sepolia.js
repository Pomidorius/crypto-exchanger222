#!/usr/bin/env node
// scripts/deploy-sepolia.js

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Цвета для логов
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deploySepolia() {
  log('🚀 Deploying to Sepolia testnet...', 'bright');
  
  try {
    // Проверяем сеть
    const network = await ethers.provider.getNetwork();
    log(`📡 Connected to network: ${network.name} (chainId: ${network.chainId})`, 'cyan');
    
    if (network.chainId !== 11155111) {
      throw new Error('Not connected to Sepolia network! Please check hardhat.config.js');
    }
    
    // Получаем деплойщика
    const [deployer] = await ethers.getSigners();
    log(`👤 Deploying with account: ${deployer.address}`, 'cyan');
    
    // Проверяем баланс
    const balance = await deployer.getBalance();
    log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`, 'cyan');
    
    if (balance.lt(ethers.utils.parseEther('0.01'))) {
      log('⚠️ Low balance! You may need more Sepolia ETH', 'yellow');
      log('💡 Get Sepolia ETH from: https://sepoliafaucet.com/', 'blue');
    }
    
    // Деплой SimpleProxySwap контракта
    log('📄 Deploying SimpleProxySwap contract...', 'magenta');
    const SimpleProxySwap = await ethers.getContractFactory('SimpleProxySwap');
    
    const contract = await SimpleProxySwap.deploy();
    await contract.deployed();
    
    log(`✅ SimpleProxySwap deployed to: ${contract.address}`, 'green');
    
    // Обновляем .env.local файл
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Обновляем или добавляем адрес контракта для Sepolia
    const contractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=${contract.address}`;
    
    if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=.*/,
        contractAddressLine
      );
    } else {
      envContent += `\n${contractAddressLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    log('✅ Updated .env.local with contract address', 'green');
    
    // Показываем информацию для Vercel
    log('', 'reset');
    log('🎉 Deployment successful!', 'bright');
    log('', 'reset');
    log('📝 For Vercel deployment, add these environment variables:', 'cyan');
    log(`NEXT_PUBLIC_CHAIN_ID=11155111`, 'blue');
    log(`NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY`, 'blue');
    log(`NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=${contract.address}`, 'blue');
    log('', 'reset');
    log('💡 Next steps:', 'cyan');
    log('  • Set up Infura/Alchemy RPC endpoint', 'reset');
    log('  • Configure environment variables in Vercel', 'reset');
    log('  • Deploy to Vercel with "npm run build:prod"', 'reset');
    
  } catch (error) {
    log('❌ Deployment failed!', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

// Запуск
deploySepolia().catch(console.error);
