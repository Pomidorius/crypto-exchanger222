#!/usr/bin/env node
// scripts/build-with-deploy.js

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let hardhatNodeProcess = null;

// Цвета для логов
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHardhatNode() {
  try {
    // Проверяем, доступен ли localhost:8545
    const http = require('http');
    
    return new Promise((resolve) => {
      const req = http.get('http://127.0.0.1:8545', (res) => {
        resolve(true);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

async function startHardhatNode() {
  log('🔄 Starting Hardhat node...', 'yellow');
  
  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';
  
  hardhatNodeProcess = spawn(npxCmd, ['hardhat', 'node'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  
  let nodeReady = false;
  
  hardhatNodeProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
      nodeReady = true;
      log('✅ Hardhat node is ready!', 'green');
    }
  });
  
  hardhatNodeProcess.stderr.on('data', (data) => {
    console.error('Hardhat node error:', data.toString());
  });
  
  // Ждем, пока нода запустится
  while (!nodeReady) {
    await sleep(500);
  }
  
  // Дополнительная пауза для стабилизации
  await sleep(2000);
}

async function deployContracts() {
  log('🚀 Deploying contracts...', 'cyan');
  
  try {
    execSync('npx hardhat run scripts/auto-deploy.js --network localhost', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log('✅ Contracts deployed successfully!', 'green');
    return true;
  } catch (error) {
    log('❌ Contract deployment failed!', 'red');
    console.error(error.message);
    return false;
  }
}

async function buildApplication() {
  log('🏗️ Building Next.js application...', 'magenta');
  
  try {
    // Очищаем кэш перед сборкой для избежания проблем с правами доступа
    try {
      execSync('powershell -Command "Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue"', {
        stdio: 'ignore',
        cwd: process.cwd()
      });
      log('🧹 Cleared build cache', 'yellow');
    } catch {
      // Игнорируем ошибки очистки кэша
    }
    
    execSync('next build', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });
    log('✅ Application built successfully!', 'green');
    return true;
  } catch (error) {
    log('❌ Application build failed!', 'red');
    console.error(error.message);
    return false;
  }
}

async function cleanup() {
  if (hardhatNodeProcess) {
    log('🧹 Cleaning up Hardhat node...', 'yellow');
    hardhatNodeProcess.kill('SIGTERM');
    
    // Дожидаемся завершения процесса
    await new Promise((resolve) => {
      hardhatNodeProcess.on('exit', resolve);
      setTimeout(resolve, 5000); // fallback timeout
    });
  }
}

async function main() {
  log('🚀 Starting build with deployment process...', 'bright');
  
  let nodeStartedByUs = false;
  
  try {
    // 1. Проверяем, нужно ли запускать Hardhat node
    const nodeRunning = await checkHardhatNode();
    
    if (!nodeRunning) {
      await startHardhatNode();
      nodeStartedByUs = true;
    } else {
      log('✅ Hardhat node is already running!', 'green');
    }
    
    // 2. Деплоим контракты
    const deploySuccess = await deployContracts();
    if (!deploySuccess) {
      if (nodeStartedByUs) {
        await cleanup();
      }
      process.exit(1);
    }
    
    // 3. Собираем приложение
    const buildSuccess = await buildApplication();
    if (!buildSuccess) {
      if (nodeStartedByUs) {
        await cleanup();
      }
      process.exit(1);
    }
    
    log('🎉 Build with deployment completed successfully!', 'bright');
    log('', 'reset');
    log('📝 Next steps:', 'cyan');
    log('  • Run "npm start" to start the production server', 'reset');
    log('  • Run "npm run dev" to start development server', 'reset');
    log('  • Contracts are deployed and ready to use', 'reset');
    
  } catch (error) {
    log('❌ Build process failed!', 'red');
    console.error(error);
    if (nodeStartedByUs) {
      await cleanup();
    }
    process.exit(1);
  }
  // Не убиваем ноду - оставляем работать для дальнейшего использования
}

// Обработка сигналов завершения
process.on('SIGINT', async () => {
  log('\n🛑 Build process interrupted', 'yellow');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n🛑 Build process terminated', 'yellow');
  await cleanup();
  process.exit(0);
});

// Запуск
main().catch(console.error);
