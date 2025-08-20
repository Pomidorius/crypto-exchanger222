console.log("🚀 Simple Auto-Deploy for Windows\n");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHardhat() {
  try {
    const { execSync } = require('child_process');
    execSync('npx hardhat --version', { stdio: 'pipe' });
    console.log("✅ Hardhat is available");
    return true;
  } catch (error) {
    console.log("❌ Hardhat not found or not working");
    console.log("💡 Try: npm install");
    return false;
  }
}

async function deployContract() {
  try {
    const { execSync } = require('child_process');
    console.log("🤖 Deploying contract...");
    
    const result = execSync('npx hardhat run scripts/auto-deploy.js --network localhost', {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log(result);
    console.log("✅ Contract deployed successfully!");
    return true;
  } catch (error) {
    console.log("❌ Contract deployment failed:");
    console.log(error.stdout || error.message);
    return false;
  }
}

async function startDev() {
  try {
    const { spawn } = require('child_process');
    console.log("🌐 Starting Next.js development server...");
    console.log("📱 Your app will be available at: http://localhost:3000");
    console.log("🛑 Press Ctrl+C to stop\n");
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    devProcess.on('error', (error) => {
      console.error('❌ Failed to start dev server:', error.message);
    });
    
  } catch (error) {
    console.log("❌ Failed to start development server:", error.message);
  }
}

async function main() {
  console.log("🔍 Step 1: Checking Hardhat...");
  const hardhatOk = await checkHardhat();
  
  if (!hardhatOk) {
    console.log("\n💡 Please run 'npm install' first");
    return;
  }
  
  console.log("\n🤖 Step 2: Deploying contract...");
  const deployOk = await deployContract();
  
  if (!deployOk) {
    console.log("\n💡 Manual steps:");
    console.log("1. Open new terminal: npm run node");
    console.log("2. Wait 5 seconds");
    console.log("3. Run: npm run auto:deploy");
    console.log("4. Run: npm run dev");
    return;
  }
  
  console.log("\n🌐 Step 3: Starting development server...");
  await startDev();
}

main().catch(console.error);
