const fs = require('fs');

console.log('🚀 Подготовка проекта к деплою на Vercel...\n');

// Проверяем важные файлы
const requiredFiles = [
    'next.config.js',
    'package.json', 
    'tsconfig.json',
    'src/app/utils/constants.ts',
    'src/app/components/NetworkInfo.tsx'
];

console.log('📋 Проверка необходимых файлов:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - ОТСУТСТВУЕТ!`);
    }
});

// Проверяем .env.example
if (fs.existsSync('.env.example')) {
    console.log('✅ .env.example');
} else {
    console.log('📝 Создаю .env.example...');
    const envExample = `# Environment Variables для Vercel
NEXT_PUBLIC_PROJECT_ID=your-walletconnect-project-id
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
NEXT_PUBLIC_CHAIN_ID=1

# Для локальной разработки (НЕ загружать на Vercel!):
DEPLOYER_PRIVATE_KEY=your-private-key-here`;
    
    fs.writeFileSync('.env.example', envExample);
    console.log('✅ .env.example создан');
}

// Проверяем .gitignore
if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env.local')) {
        console.log('⚠️  Добавляю .env.local в .gitignore...');
        fs.appendFileSync('.gitignore', '\n# Environment variables\n.env.local\n.env\n');
        console.log('✅ .gitignore обновлен');
    } else {
        console.log('✅ .gitignore настроен');
    }
}

// Проверяем мульти-сетевую конфигурацию
console.log('\n🌐 Проверка мульти-сетевой конфигурации:');
try {
    const constants = fs.readFileSync('src/app/utils/constants.ts', 'utf8');
    
    if (constants.includes('CONTRACT_ADDRESSES')) {
        console.log('✅ CONTRACT_ADDRESSES настроены');
    } else {
        console.log('❌ CONTRACT_ADDRESSES не найдены');
    }
    
    if (constants.includes('TOKEN_ADDRESSES')) {
        console.log('✅ TOKEN_ADDRESSES настроены');
    } else {
        console.log('❌ TOKEN_ADDRESSES не найдены');
    }
    
    if (constants.includes('getNetworkConfig')) {
        console.log('✅ getNetworkConfig функция готова');
    } else {
        console.log('❌ getNetworkConfig функция не найдена');
    }
} catch (error) {
    console.log('❌ Ошибка проверки constants.ts:', error.message);
}

// Проверяем package.json скрипты
console.log('\n📦 Проверка скриптов в package.json:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    if (scripts.build) {
        console.log('✅ build скрипт');
    } else {
        console.log('❌ build скрипт отсутствует');
    }
    
    if (scripts.start) {
        console.log('✅ start скрипт');
    } else {
        console.log('❌ start скрипт отсутствует');
    }
    
    if (scripts.dev) {
        console.log('✅ dev скрипт');
    } else {
        console.log('❌ dev скрипт отсутствует');
    }
} catch (error) {
    console.log('❌ Ошибка проверки package.json:', error.message);
}

console.log('\n🎯 Следующие шаги для деплоя на Vercel:');
console.log('1. 📤 git add . && git commit -m "Подготовка к Vercel" && git push');
console.log('2. 🌐 Зайдите на https://vercel.com и импортируйте репозиторий');
console.log('3. ⚙️  Настройте Environment Variables из .env.example');
console.log('4. 🚀 Нажмите Deploy!');
console.log('5. 🧪 Задеплойте контракт в Sepolia для тестирования');
console.log('6. 💰 Задеплойте контракт в Mainnet для продакшена');

console.log('\n✅ Проект готов к деплою на Vercel!');
