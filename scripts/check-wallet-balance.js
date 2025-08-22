const hre = require("hardhat");

async function main() {
    console.log("💰 Checking wallet balances...");
    
    // Ваш адрес кошелька
    const WALLET_ADDRESS = "0xF1BC2b8b3269fc585fC4f63Ff49ED279a5a55C82";
    
    // Адреса контрактов
    const USDC_ADDRESS = "0x82532e843530D8734F5Cf84eb833fab19394dfd2";
    const USDT_ADDRESS = "0xFA195D6c7c0Ed19E913E30e6F019E0B13cD1e77d";
    const CONTRACT_ADDRESS = "0x01b44565F7Bb276E156023699225612887c63AC3";
    
    try {
        // Проверяем ETH баланс
        const ethBalance = await hre.ethers.provider.getBalance(WALLET_ADDRESS);
        console.log(`\n📊 Wallet: ${WALLET_ADDRESS}`);
        console.log(`ETH Balance: ${hre.ethers.utils.formatEther(ethBalance)}`);
        
        // Получаем контракты токенов
        const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const usdc = MockERC20.attach(USDC_ADDRESS);
        const usdt = MockERC20.attach(USDT_ADDRESS);
        
        // Проверяем балансы токенов
        const usdcBalance = await usdc.balanceOf(WALLET_ADDRESS);
        const usdtBalance = await usdt.balanceOf(WALLET_ADDRESS);
        
        console.log(`USDC Balance: ${hre.ethers.utils.formatEther(usdcBalance)}`);
        console.log(`USDT Balance: ${hre.ethers.utils.formatEther(usdtBalance)}`);
        
        // Проверяем балансы контракта для сравнения
        console.log(`\n📋 Contract: ${CONTRACT_ADDRESS}`);
        const contractEthBalance = await hre.ethers.provider.getBalance(CONTRACT_ADDRESS);
        const contractUsdcBalance = await usdc.balanceOf(CONTRACT_ADDRESS);
        const contractUsdtBalance = await usdt.balanceOf(CONTRACT_ADDRESS);
        
        console.log(`Contract ETH: ${hre.ethers.utils.formatEther(contractEthBalance)}`);
        console.log(`Contract USDC: ${hre.ethers.utils.formatEther(contractUsdcBalance)}`);
        console.log(`Contract USDT: ${hre.ethers.utils.formatEther(contractUsdtBalance)}`);
        
        // Проверяем, есть ли у кошелька allowance для контракта
        console.log(`\n🔐 Allowances:`);
        const usdcAllowance = await usdc.allowance(WALLET_ADDRESS, CONTRACT_ADDRESS);
        const usdtAllowance = await usdt.allowance(WALLET_ADDRESS, CONTRACT_ADDRESS);
        
        console.log(`USDC Allowance: ${hre.ethers.utils.formatEther(usdcAllowance)}`);
        console.log(`USDT Allowance: ${hre.ethers.utils.formatEther(usdtAllowance)}`);
        
    } catch (error) {
        console.error("❌ Error checking balances:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
