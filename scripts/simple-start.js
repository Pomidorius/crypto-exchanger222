const { exec } = require('child_process');
const path = require('path');

console.log("🚀 Starting Crypto Exchanger with Auto-Deploy\n");

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    console.log(`💻 Running: ${command}\n`);
    
    const child = exec(command, { 
      cwd: process.cwd(),
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed\n`);
        resolve();
      } else {
        console.log(`❌ ${description} failed with code ${code}\n`);
        reject(new Error(`Command failed: ${command}`));
      }
    });
  });
}

async function startWithAutoDeploy() {
  try {
    console.log("🔧 Step 1: Installing dependencies");
    await runCommand('npm install', 'Installing dependencies');
    
    console.log("🤖 Step 2: Running auto-deploy");
    await runCommand('npm run auto:deploy', 'Auto-deploying contract');
    
    console.log("🌐 Step 3: Starting development server");
    console.log("📱 Your app will be available at: http://localhost:3000");
    console.log("🛑 Press Ctrl+C to stop\n");
    
    // Start dev server (this will keep running)
    await runCommand('npm run dev', 'Starting Next.js development server');
    
  } catch (error) {
    console.error("\n❌ Auto-deploy failed:", error.message);
    console.log("\n💡 Manual setup instructions:");
    console.log("1. Open new terminal and run: npm run node");
    console.log("2. Wait 5 seconds, then run: npm run auto:deploy");
    console.log("3. Finally run: npm run dev");
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

startWithAutoDeploy();
