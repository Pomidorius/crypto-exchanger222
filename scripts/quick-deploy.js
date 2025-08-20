#!/usr/bin/env node
// scripts/quick-deploy.js

const { execSync } = require('child_process');

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

async function quickDeploy() {
  log('⚡ Quick Deploy: Deploying contracts to running Hardhat node...', 'bright');
  
  try {
    // Запускаем автодеплой
    execSync('npx hardhat run scripts/auto-deploy.js --network localhost', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    log('✅ Quick deployment completed!', 'green');
    log('🔗 Contracts are ready for use', 'cyan');
    
  } catch (error) {
    log('❌ Quick deployment failed!', 'red');
    log('💡 Make sure Hardhat node is running: npm run node', 'yellow');
    console.error(error.message);
    process.exit(1);
  }
}

// Запуск
quickDeploy().catch(console.error);
