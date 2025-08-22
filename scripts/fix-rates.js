const hre = require("hardhat");

async function main() {
    console.log("🔧 Setting exchange rates for ImprovedProxySwap...");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using account:", deployer.address);
    
    // Contract addresses
    const CONTRACT_ADDRESS = "0x01b44565F7Bb276E156023699225612887c63AC3";
    const USDC_ADDRESS = "0x82532e843530D8734F5Cf84eb833fab19394dfd2";
    const USDT_ADDRESS = "0xFA195D6c7c0Ed19E913E30e6F019E0B13cD1e77d";
    
    // Get contract
    const ProxySwap = await hre.ethers.getContractFactory("ImprovedProxySwap");
    const proxySwap = ProxySwap.attach(CONTRACT_ADDRESS);
    
    console.log("📊 Setting exchange rates...");
    
    try {
        // ETH (address(0)) to tokens - 1 ETH = 2500 tokens
        const ethToTokenRate = hre.ethers.utils.parseEther("2500");
        
        console.log("Setting ETH -> USDC rate...");
        let tx = await proxySwap.setExchangeRate(hre.ethers.constants.AddressZero, USDC_ADDRESS, ethToTokenRate);
        await tx.wait();
        console.log("✅ ETH -> USDC rate set");
        
        console.log("Setting ETH -> USDT rate...");
        tx = await proxySwap.setExchangeRate(hre.ethers.constants.AddressZero, USDT_ADDRESS, ethToTokenRate);
        await tx.wait();
        console.log("✅ ETH -> USDT rate set");
        
        // Tokens to ETH - 1 token = 0.0004 ETH
        const tokenToEthRate = hre.ethers.utils.parseEther("0.0004");
        
        console.log("Setting USDC -> ETH rate...");
        tx = await proxySwap.setExchangeRate(USDC_ADDRESS, hre.ethers.constants.AddressZero, tokenToEthRate);
        await tx.wait();
        console.log("✅ USDC -> ETH rate set");
        
        console.log("Setting USDT -> ETH rate...");
        tx = await proxySwap.setExchangeRate(USDT_ADDRESS, hre.ethers.constants.AddressZero, tokenToEthRate);
        await tx.wait();
        console.log("✅ USDT -> ETH rate set");
        
        // Token to token rates (1:1)
        const tokenToTokenRate = hre.ethers.utils.parseEther("1");
        
        console.log("Setting USDC -> USDT rate...");
        tx = await proxySwap.setExchangeRate(USDC_ADDRESS, USDT_ADDRESS, tokenToTokenRate);
        await tx.wait();
        console.log("✅ USDC -> USDT rate set");
        
        console.log("Setting USDT -> USDC rate...");
        tx = await proxySwap.setExchangeRate(USDT_ADDRESS, USDC_ADDRESS, tokenToTokenRate);
        await tx.wait();
        console.log("✅ USDT -> USDC rate set");
        
        console.log("\n🔍 Verifying rates...");
        
        const ethToUsdc = await proxySwap.exchangeRates(hre.ethers.constants.AddressZero, USDC_ADDRESS);
        console.log(`ETH -> USDC: ${hre.ethers.utils.formatEther(ethToUsdc)}`);
        
        const usdcToEth = await proxySwap.exchangeRates(USDC_ADDRESS, hre.ethers.constants.AddressZero);
        console.log(`USDC -> ETH: ${hre.ethers.utils.formatEther(usdcToEth)}`);
        
        const ethToUsdt = await proxySwap.exchangeRates(hre.ethers.constants.AddressZero, USDT_ADDRESS);
        console.log(`ETH -> USDT: ${hre.ethers.utils.formatEther(ethToUsdt)}`);
        
        const usdtToEth = await proxySwap.exchangeRates(USDT_ADDRESS, hre.ethers.constants.AddressZero);
        console.log(`USDT -> ETH: ${hre.ethers.utils.formatEther(usdtToEth)}`);
        
        console.log("\n✅ All exchange rates set successfully!");
        
    } catch (error) {
        console.error("❌ Error setting rates:", error.message);
        throw error;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
