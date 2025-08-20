const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deploySepoliaForVercel() {
  try {
    log('🚀 Deploying ImprovedProxySwap to Sepolia for Vercel...', 'bright');
    
    // Проверяем что у нас есть приватный ключ
    if (!process.env.DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY === 'your_private_key_here') {
      log('❌ DEPLOYER_PRIVATE_KEY not set!', 'red');
      log('', 'reset');
      log('📝 Steps to deploy:', 'cyan');
      log('1. Get Sepolia ETH: https://sepoliafaucet.com/', 'reset');
      log('2. Export your private key from MetaMask', 'reset');
      log('3. Set DEPLOYER_PRIVATE_KEY in .env file', 'reset');
      log('4. Run: npm run deploy:sepolia', 'reset');
      return;
    }
    
    // Получаем аккаунт для деплоя
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    
    log(`📋 Deployer: ${deployer.address}`, 'cyan');
    log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`, 'cyan');
    
    if (balance.lt(ethers.utils.parseEther('0.01'))) {
      log('⚠️ Low balance! Get some Sepolia ETH:', 'yellow');
      log('https://sepoliafaucet.com/', 'blue');
    }
    
    // Деплоим контракт
    log('📦 Deploying ImprovedProxySwap contract...', 'cyan');
    const ProxySwap = await ethers.getContractFactory('ImprovedProxySwap');
    const contract = await ProxySwap.deploy();
    
    log('⏳ Waiting for deployment...', 'yellow');
    await contract.deployed();
    
    log('✅ Contract deployed!', 'green');
    log(`📍 Address: ${contract.address}`, 'green');
    log(`🔗 Etherscan: https://sepolia.etherscan.io/address/${contract.address}`, 'blue');
    
    // Проверяем что контракт работает
    log('🔍 Verifying contract...', 'cyan');
    const owner = await contract.owner();
    log(`👤 Owner: ${owner}`, 'cyan');
    
    // Обновляем файл constants.ts
    log('📝 Updating constants.ts...', 'cyan');
    const constantsPath = path.join(process.cwd(), 'src', 'app', 'utils', 'constants.ts');
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Заменяем адрес контракта для Sepolia
    constantsContent = constantsContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA.*?'0x[^']*'/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '${contract.address}'`
    );
    
    fs.writeFileSync(constantsPath, constantsContent);
    log('✅ Updated constants.ts', 'green');
    
    // Создаем/обновляем .env.local для Sepolia
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Обновляем или добавляем переменные для Sepolia
    const updates = [
      `NEXT_PUBLIC_CHAIN_ID=11155111`,
      `NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=${contract.address}`,
      `NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a`
    ];
    
    updates.forEach(update => {
      const [key] = update.split('=');
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`${key}=.*`), update);
      } else {
        envContent += `\n${update}`;
      }
    });
    
    fs.writeFileSync(envPath, envContent);
    log('✅ Updated .env.local', 'green');
    
    // Показываем информацию для Vercel
    log('', 'reset');
    log('🎉 Deployment successful!', 'bright');
    log('', 'reset');
    log('📝 For Vercel deployment, add these environment variables:', 'cyan');
    log(`NEXT_PUBLIC_CHAIN_ID=11155111`, 'blue');
    log(`NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY`, 'blue');
    log(`NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=${contract.address}`, 'blue');
    log(`NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id`, 'blue');
    log('', 'reset');
    log('💡 Next steps for Vercel:', 'cyan');
    log('  1. Go to vercel.com/dashboard', 'reset');
    log('  2. Import your GitHub repository', 'reset');
    log('  3. Add environment variables in project settings', 'reset');
    log('  4. Deploy!', 'reset');
    log('', 'reset');
    log('🧪 Test your deployment:', 'cyan');
    log(`  • Local: npm run dev`, 'reset');
    log(`  • Sepolia Etherscan: https://sepolia.etherscan.io/address/${contract.address}`, 'reset');
    
  } catch (error) {
    log('❌ Deployment failed!', 'red');
    console.error(error.message);
    
    if (error.message.includes('insufficient funds')) {
      log('', 'reset');
      log('💡 Solution: Get Sepolia ETH', 'yellow');
      log('https://sepoliafaucet.com/', 'blue');
    }
    
    process.exit(1);
  }
}

// Запускаем деплой
deploySepoliaForVercel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
