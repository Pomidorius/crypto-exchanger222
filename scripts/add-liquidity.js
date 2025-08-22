const hre = require("hardhat");

async function main() {
    console.log("💰 Adding token liquidity to contract...");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using account:", deployer.address);
    
    // Contract addresses
    const CONTRACT_ADDRESS = "0x01b44565F7Bb276E156023699225612887c63AC3";
    const USDC_ADDRESS = "0x82532e843530D8734F5Cf84eb833fab19394dfd2";
    const USDT_ADDRESS = "0xFA195D6c7c0Ed19E913E30e6F019E0B13cD1e77d";
    
    // Get token contracts
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const usdc = MockERC20.attach(USDC_ADDRESS);
    const usdt = MockERC20.attach(USDT_ADDRESS);
    
    // Amount to transfer (100,000 tokens each)
    const liquidityAmount = hre.ethers.utils.parseEther("100000");
    
    console.log("📊 Current balances:");
    const deployerUsdcBalance = await usdc.balanceOf(deployer.address);
    const deployerUsdtBalance = await usdt.balanceOf(deployer.address);
    console.log(`Deployer USDC: ${hre.ethers.utils.formatEther(deployerUsdcBalance)}`);
    console.log(`Deployer USDT: ${hre.ethers.utils.formatEther(deployerUsdtBalance)}`);
    
    const contractUsdcBalance = await usdc.balanceOf(CONTRACT_ADDRESS);
    const contractUsdtBalance = await usdt.balanceOf(CONTRACT_ADDRESS);
    console.log(`Contract USDC: ${hre.ethers.utils.formatEther(contractUsdcBalance)}`);
    console.log(`Contract USDT: ${hre.ethers.utils.formatEther(contractUsdtBalance)}`);
    
    try {
        console.log("\n💸 Transferring tokens to contract...");
        
        // Transfer USDC
        console.log("Transferring USDC...");
        let tx = await usdc.transfer(CONTRACT_ADDRESS, liquidityAmount);
        await tx.wait();
        console.log("✅ USDC transferred");
        
        // Transfer USDT
        console.log("Transferring USDT...");
        tx = await usdt.transfer(CONTRACT_ADDRESS, liquidityAmount);
        await tx.wait();
        console.log("✅ USDT transferred");
        
        console.log("\n📊 New balances:");
        const newContractUsdcBalance = await usdc.balanceOf(CONTRACT_ADDRESS);
        const newContractUsdtBalance = await usdt.balanceOf(CONTRACT_ADDRESS);
        console.log(`Contract USDC: ${hre.ethers.utils.formatEther(newContractUsdcBalance)}`);
        console.log(`Contract USDT: ${hre.ethers.utils.formatEther(newContractUsdtBalance)}`);
        
        const newDeployerUsdcBalance = await usdc.balanceOf(deployer.address);
        const newDeployerUsdtBalance = await usdt.balanceOf(deployer.address);
        console.log(`Deployer USDC remaining: ${hre.ethers.utils.formatEther(newDeployerUsdcBalance)}`);
        console.log(`Deployer USDT remaining: ${hre.ethers.utils.formatEther(newDeployerUsdtBalance)}`);
        
        console.log("\n✅ Liquidity added successfully!");
        console.log("🎯 Contract is now ready for swaps!");
        
    } catch (error) {
        console.error("❌ Error adding liquidity:", error.message);
        throw error;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
