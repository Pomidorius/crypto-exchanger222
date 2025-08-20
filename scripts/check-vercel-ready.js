const fs = require('fs');
const path = require('path');

console.log('🔍 ПРОВЕРКА ГОТОВНОСТИ К VERCEL DEPLOYMENT\n');

// Проверяем environment variables
console.log('📋 Environment Variables:');
console.log('==========================');

const requiredVars = [
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_RPC_URL', 
  'NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA',
  'NEXT_PUBLIC_PROJECT_ID'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value && value !== 'dummy-project-id-for-local-dev' && value !== '0x0000000000000000000000000000000000000001';
  
  console.log(`${status ? '✅' : '❌'} ${varName}: ${value || 'НЕ УСТАНОВЛЕНА'}`);
  
  if (!status) allGood = false;
});

// Проверяем .env файлы
console.log('\n📁 Config Files:');
console.log('================');

const envFiles = ['.env.local', '.env', 'vercel.json', 'next.config.js'];
envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Проверяем контракт
console.log('\n🔧 Contract Status:');
console.log('==================');

try {
  const constants = require('./src/app/utils/constants.ts');
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || '0x0000000000000000000000000000000000000001';
  const isDeployed = contractAddress !== '0x0000000000000000000000000000000000000001';
  
  console.log(`${isDeployed ? '✅' : '❌'} Contract Address: ${contractAddress}`);
  console.log(`${isDeployed ? '✅' : '❌'} Contract Deployed: ${isDeployed ? 'YES' : 'NO - NEEDS DEPLOYMENT'}`);
  
  if (!isDeployed) allGood = false;
} catch (error) {
  console.log('❌ Constants file error:', error.message);
  allGood = false;
}

// Проверяем сборку
console.log('\n🔨 Build Test:');
console.log('==============');

try {
  const { execSync } = require('child_process');
  console.log('🧪 Testing Next.js build...');
  
  // Запускаем сборку
  execSync('npm run build:vercel', { stdio: 'pipe' });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  allGood = false;
}

// Итоговый результат
console.log('\n🎯 ИТОГОВЫЙ СТАТУС:');
console.log('==================');

if (allGood) {
  console.log('🎉 ВСЕ ГОТОВО ДЛЯ VERCEL DEPLOYMENT!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Добавьте environment variables в Vercel Dashboard');
  console.log('2. Деплойте: git push origin main');
  console.log('3. Тестируйте на your-app.vercel.app');
} else {
  console.log('⚠️  НЕ ГОТОВО! Исправьте ошибки выше.');
  console.log('');
  console.log('📖 Читайте VERCEL_READY_CHECKLIST.md для инструкций');
}

console.log('');

module.exports = { allGood };
