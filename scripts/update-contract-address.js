const fs = require('fs');
const path = require('path');

async function updateProxySwapAddress() {
  try {
    // Ищем deployment файлы (сначала localhost, потом mainnet)
    let deploymentPath = path.join(__dirname, '..', 'localhost-deployment.json');
    let networkName = 'testnet/localhost';
    
    if (!fs.existsSync(deploymentPath)) {
      deploymentPath = path.join(__dirname, '..', 'mainnet-deployment.json');
      networkName = 'mainnet';
    }
    
    if (!fs.existsSync(deploymentPath)) {
      console.error('❌ No deployment file found. Deploy contract first with:');
      console.error('   npm run deploy:sepolia (for testnet)');
      console.error('   npm run deploy:mainnet (for mainnet)');
      return;
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contractAddress = deployment.contractAddress;
    
    console.log(`📍 Contract address from ${networkName}:`, contractAddress);
    
    // Читаем constants.ts
    const constantsPath = path.join(__dirname, '..', 'src', 'app', 'utils', 'constants.ts');
    let content = fs.readFileSync(constantsPath, 'utf8');
    
    // Обновляем PROXY_SWAP_ADDRESS
    const oldPattern = /export const PROXY_SWAP_ADDRESS = '[^']*';/;
    const newLine = `export const PROXY_SWAP_ADDRESS = '${contractAddress}';`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newLine);
    } else {
      // Если паттерн не найден, добавляем после комментария
      const insertPattern = /(\/\/ Укажите адрес ProxySwap после деплоя в mainnet\n)/;
      content = content.replace(insertPattern, `$1${newLine}\n`);
    }
    
    // Записываем обновленный файл
    fs.writeFileSync(constantsPath, content);
    
    console.log('✅ constants.ts updated successfully!');
    console.log('📋 PROXY_SWAP_ADDRESS set to:', contractAddress);
    
  } catch (error) {
    console.error('❌ Error updating constants.ts:', error.message);
  }
}

updateProxySwapAddress();
