const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log("🚀 Starting development environment with auto-deploy...\n");

// Определяем команду npm для Windows/Unix
const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

async function startWithAutoDeploy() {
  // 1. Сначала запускаем Hardhat node
  console.log("📡 Starting Hardhat local node...");
  const hardhatProcess = spawn(npxCmd, ['hardhat', 'node'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  
  let nodeReady = false;
  
  hardhatProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[Hardhat]', output.trim());
    
    // Ждем когда node будет готов
    if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
      nodeReady = true;
      console.log("✅ Hardhat node is ready!");
      
      // Ждем немного и запускаем деплой
      setTimeout(() => {
        deployContract();
      }, 2000);
    }
  });
  
  hardhatProcess.stderr.on('data', (data) => {
    console.error('[Hardhat Error]', data.toString());
  });
  
  // 2. Функция деплоя контракта
  async function deployContract() {
    console.log("\n🤖 Auto-deploying contract...");
    
    const deployProcess = spawn(npxCmd, ['hardhat', 'run', 'scripts/auto-deploy.js', '--network', 'localhost'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    deployProcess.stdout.on('data', (data) => {
      console.log('[Deploy]', data.toString().trim());
    });
    
    deployProcess.stderr.on('data', (data) => {
      console.error('[Deploy Error]', data.toString());
    });
    
    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log("✅ Contract deployed successfully!");
        startNextJS();
      } else {
        console.error("❌ Contract deployment failed");
        process.exit(1);
      }
    });
  }
  
  // 3. Функция запуска Next.js
  function startNextJS() {
    console.log("\n🌐 Starting Next.js development server...");
    
    const nextProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    nextProcess.on('close', (code) => {
      console.log(`Next.js process exited with code ${code}`);
      hardhatProcess.kill();
    });
  }
  
  // Обработка завершения
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    hardhatProcess.kill();
    process.exit(0);
  });
}

startWithAutoDeploy().catch(console.error);
