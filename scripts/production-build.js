#!/usr/bin/env node
// scripts/production-build.js

const { execSync } = require('child_process');
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

function checkEnvironmentFile() {
  const envFile = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envFile)) {
    log('⚠️ .env.local file not found', 'yellow');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  // Проверяем основные переменные
  const requiredVars = [
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_RPC_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(varName) || envContent.includes(`${varName}=`)
  );
  
  if (missingVars.length > 0) {
    log('⚠️ Missing environment variables:', 'yellow');
    missingVars.forEach(varName => log(`  • ${varName}`, 'yellow'));
    return false;
  }
  
  return true;
}

async function productionBuild() {
  log('🏭 Starting production build...', 'bright');
  
  try {
    // 1. Проверяем переменные окружения
    log('🔍 Checking environment configuration...', 'cyan');
    const envOk = checkEnvironmentFile();
    
    if (!envOk) {
      log('💡 Environment setup recommendations:', 'blue');
      log('  • Copy .env.local.example to .env.local', 'reset');
      log('  • Configure your network settings', 'reset');
      log('  • Set CONTRACT_ADDRESS if deploying to live network', 'reset');
    }
    
    // 2. Проверяем, есть ли контракты
    log('📋 Checking contract configuration...', 'cyan');
    const constantsFile = path.join(process.cwd(), 'src', 'app', 'utils', 'constants.ts');
    
    if (fs.existsSync(constantsFile)) {
      const constantsContent = fs.readFileSync(constantsFile, 'utf8');
      
      if (constantsContent.includes('0x0000000000000000000000000000000000000001')) {
        log('⚠️ Default contract addresses detected', 'yellow');
        log('💡 For production, make sure to deploy contracts first', 'blue');
      } else {
        log('✅ Contract addresses configured', 'green');
      }
    }
    
    // 3. Сборка
    log('🏗️ Building Next.js application...', 'magenta');
    execSync('next build', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // 4. Проверяем результат сборки
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      log('✅ Production build completed successfully!', 'green');
      
      // Показываем информацию о сборке
      const stats = fs.statSync(buildDir);
      log(`📊 Build output: ${buildDir}`, 'cyan');
      log(`📅 Build time: ${stats.mtime.toLocaleString()}`, 'cyan');
    }
    
    log('', 'reset');
    log('🎉 Production build ready!', 'bright');
    log('', 'reset');
    log('📝 Next steps:', 'cyan');
    log('  • Run "npm start" to start production server', 'reset');
    log('  • Deploy .next folder to your hosting provider', 'reset');
    log('  • Make sure environment variables are set in production', 'reset');
    
  } catch (error) {
    log('❌ Production build failed!', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

// Запуск
productionBuild().catch(console.error);
