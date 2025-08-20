#!/usr/bin/env node

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

function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'cyan');
  
  const requiredVars = {
    'NEXT_PUBLIC_CHAIN_ID': '11155111',
    'NEXT_PUBLIC_RPC_URL': 'должен содержать infura.io',
    'NEXT_PUBLIC_PROJECT_ID': 'НЕ должен быть dummy-project-id',
    'NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA': 'НЕ должен быть 0x000...001'
  };
  
  let allGood = true;
  
  Object.entries(requiredVars).forEach(([varName, requirement]) => {
    const value = process.env[varName];
    
    if (!value) {
      log(`  ❌ ${varName} - НЕ ЗАДАНА`, 'red');
      allGood = false;
    } else if (varName === 'NEXT_PUBLIC_CHAIN_ID' && value !== '11155111') {
      log(`  ❌ ${varName} - должно быть 11155111, текущее: ${value}`, 'red');
      allGood = false;
    } else if (varName === 'NEXT_PUBLIC_RPC_URL' && !value.includes('infura.io')) {
      log(`  ❌ ${varName} - должен содержать infura.io`, 'red');
      allGood = false;
    } else if (varName === 'NEXT_PUBLIC_PROJECT_ID' && value.includes('dummy')) {
      log(`  ❌ ${varName} - нужен реальный WalletConnect Project ID`, 'red');
      allGood = false;
    } else if (varName === 'NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA' && value === '0x0000000000000000000000000000000000000001') {
      log(`  ❌ ${varName} - нужен реальный адрес контракта`, 'red');
      allGood = false;
    } else {
      log(`  ✅ ${varName} - OK`, 'green');
    }
  });
  
  return allGood;
}

function checkContractDeployment() {
  log('\n📦 Checking Contract Deployment...', 'cyan');
  
  const constantsPath = path.join(process.cwd(), 'src', 'app', 'utils', 'constants.ts');
  
  if (!fs.existsSync(constantsPath)) {
    log('  ❌ constants.ts file not found', 'red');
    return false;
  }
  
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  
  if (constantsContent.includes('0x0000000000000000000000000000000000000001')) {
    log('  ❌ Contract address is placeholder (0x000...001)', 'red');
    log('  💡 Run: npm run deploy:sepolia', 'yellow');
    return false;
  }
  
  log('  ✅ Contract address looks valid', 'green');
  return true;
}

function checkBuildConfiguration() {
  log('\n🔧 Checking Build Configuration...', 'cyan');
  
  const files = [
    'next.config.js',
    'vercel.json',
    'package.json'
  ];
  
  let allGood = true;
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file} - EXISTS`, 'green');
    } else {
      log(`  ❌ ${file} - MISSING`, 'red');
      allGood = false;
    }
  });
  
  return allGood;
}

function checkDependencies() {
  log('\n📦 Checking Dependencies...', 'cyan');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log('  ❌ package.json not found', 'red');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = [
    '@rainbow-me/rainbowkit',
    'wagmi',
    'viem',
    'next'
  ];
  
  let allGood = true;
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      log(`  ✅ ${dep} - INSTALLED`, 'green');
    } else {
      log(`  ❌ ${dep} - MISSING`, 'red');
      allGood = false;
    }
  });
  
  return allGood;
}

function showNextSteps() {
  log('\n🚀 NEXT STEPS TO DEPLOY:', 'bright');
  
  log('\n1️⃣ Get WalletConnect Project ID:', 'cyan');
  log('   • Go to https://cloud.walletconnect.com/', 'reset');
  log('   • Create account & project', 'reset');
  log('   • Copy Project ID', 'reset');
  
  log('\n2️⃣ Deploy Contract to Sepolia:', 'cyan');
  log('   • Get Sepolia ETH: https://sepoliafaucet.com/', 'reset');
  log('   • Add private key to .env file', 'reset');
  log('   • Run: npm run deploy:sepolia', 'reset');
  
  log('\n3️⃣ Configure Vercel Environment Variables:', 'cyan');
  log('   NEXT_PUBLIC_CHAIN_ID=11155111', 'blue');
  log('   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/07818f3d4fa54707c26200df522d4863', 'blue');
  log('   NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0xYOUR_CONTRACT_ADDRESS', 'blue');
  log('   NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id', 'blue');
  
  log('\n4️⃣ Deploy to Vercel:', 'cyan');
  log('   • Push to GitHub', 'reset');
  log('   • Vercel will auto-deploy', 'reset');
  
  log('\n⏱️ Total time: ~20 minutes', 'green');
  log('💰 Total cost: $0 (free tier)', 'green');
}

async function main() {
  log('🎯 VERCEL DEPLOYMENT READINESS CHECK', 'bright');
  log('=====================================', 'bright');
  
  const envCheck = checkEnvironmentVariables();
  const contractCheck = checkContractDeployment();
  const buildCheck = checkBuildConfiguration();
  const depsCheck = checkDependencies();
  
  const overallStatus = envCheck && contractCheck && buildCheck && depsCheck;
  
  log('\n📊 OVERALL STATUS:', 'bright');
  
  if (overallStatus) {
    log('🎉 READY FOR VERCEL DEPLOYMENT!', 'green');
    log('✅ All checks passed', 'green');
    log('\n💡 You can now deploy to Vercel!', 'cyan');
  } else {
    log('⚠️ NOT READY YET', 'yellow');
    log('❌ Some checks failed', 'red');
    showNextSteps();
  }
  
  log('\n🔗 Useful links:', 'cyan');
  log('• Sepolia Faucet: https://sepoliafaucet.com/', 'reset');
  log('• WalletConnect: https://cloud.walletconnect.com/', 'reset');
  log('• Vercel Dashboard: https://vercel.com/dashboard', 'reset');
  log('• Documentation: ./VERCEL_DEPLOY_GUIDE.md', 'reset');
}

main().catch(console.error);
