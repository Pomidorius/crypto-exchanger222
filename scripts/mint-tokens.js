// scripts/mint-tokens.js
// Минтит токены на указанный аккаунт для тестирования

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Minting tokens for testing...");

  // Адреса контрактов
  const USDC_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const USDT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const WETH_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  // Тестовый аккаунт (первый аккаунт Hardhat)
  const TEST_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Подключаемся к контрактам токенов
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  
  const mockUSDC = MockERC20.attach(USDC_ADDRESS);
  const mockUSDT = MockERC20.attach(USDT_ADDRESS);
  const mockWETH = MockERC20.attach(WETH_ADDRESS);

  console.log("💰 Minting tokens...");

  try {
    // Минтим токены (много для тестирования)
    await mockUSDC.mint(TEST_ACCOUNT, "1000000000000"); // 1,000,000 USDC (6 decimals)
    await mockUSDT.mint(TEST_ACCOUNT, "1000000000000"); // 1,000,000 USDT (6 decimals)  
    await mockWETH.mint(TEST_ACCOUNT, ethers.utils.parseEther("1000")); // 1,000 WETH

    console.log("✅ Tokens minted successfully!");
    console.log(`💰 ${TEST_ACCOUNT} now has:`);
    console.log(`   - 1,000,000 USDC`);
    console.log(`   - 1,000,000 USDT`);
    console.log(`   - 1,000 WETH`);
    
    console.log("\n📋 Add these tokens to MetaMask:");
    console.log("================================");
    console.log(`USDC: ${USDC_ADDRESS}`);
    console.log(`USDT: ${USDT_ADDRESS}`);
    console.log(`WETH: ${WETH_ADDRESS}`);

  } catch (error) {
    console.error("❌ Error minting tokens:", error.message);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
