const hre = require("hardhat");

async function main() {
    console.log("🔍 Checking token contracts...");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    // Token addresses
    const USDC_ADDRESS = "0x82532e843530D8734F5Cf84eb833fab19394dfd2";
    const USDT_ADDRESS = "0xFA195D6c7c0Ed19E913E30e6F019E0B13cD1e77d";
    const CONTRACT_ADDRESS = "0x01b44565F7Bb276E156023699225612887c63AC3";
    
    try {
        // Check if contracts exist
        const usdcCode = await hre.ethers.provider.getCode(USDC_ADDRESS);
        const usdtCode = await hre.ethers.provider.getCode(USDT_ADDRESS);
        const contractCode = await hre.ethers.provider.getCode(CONTRACT_ADDRESS);
        
        console.log("USDC deployed:", usdcCode !== "0x");
        console.log("USDT deployed:", usdtCode !== "0x");
        console.log("ProxySwap deployed:", contractCode !== "0x");
        
        if (usdcCode === "0x") {
            console.log("❌ USDC contract not found at", USDC_ADDRESS);
            return;
        }
        
        if (usdtCode === "0x") {
            console.log("❌ USDT contract not found at", USDT_ADDRESS);
            return;
        }
        
        // Get token contracts
        const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const usdc = MockERC20.attach(USDC_ADDRESS);
        const usdt = MockERC20.attach(USDT_ADDRESS);
        
        // Check token info
        console.log("\n📊 Token Information:");
        
        try {
            const usdcName = await usdc.name();
            const usdcSymbol = await usdc.symbol();
            const usdcDecimals = await usdc.decimals();
            const usdcTotalSupply = await usdc.totalSupply();
            
            console.log(`USDC: ${usdcName} (${usdcSymbol})`);
            console.log(`Decimals: ${usdcDecimals}`);
            console.log(`Total Supply: ${hre.ethers.utils.formatEther(usdcTotalSupply)}`);
            
            const usdcBalance = await usdc.balanceOf(deployer.address);
            console.log(`Deployer USDC balance: ${hre.ethers.utils.formatEther(usdcBalance)}`);
            
        } catch (error) {
            console.log("❌ Error reading USDC:", error.message);
        }
        
        try {
            const usdtName = await usdt.name();
            const usdtSymbol = await usdt.symbol();
            const usdtDecimals = await usdt.decimals();
            const usdtTotalSupply = await usdt.totalSupply();
            
            console.log(`\nUSDT: ${usdtName} (${usdtSymbol})`);
            console.log(`Decimals: ${usdtDecimals}`);
            console.log(`Total Supply: ${hre.ethers.utils.formatEther(usdtTotalSupply)}`);
            
            const usdtBalance = await usdt.balanceOf(deployer.address);
            console.log(`Deployer USDT balance: ${hre.ethers.utils.formatEther(usdtBalance)}`);
            
        } catch (error) {
            console.log("❌ Error reading USDT:", error.message);
        }
        
        // Check ProxySwap contract
        if (contractCode !== "0x") {
            const ProxySwap = await hre.ethers.getContractFactory("ImprovedProxySwap");
            const proxySwap = ProxySwap.attach(CONTRACT_ADDRESS);
            
            console.log("\n📋 ProxySwap Contract:");
            
            try {
                const owner = await proxySwap.owner();
                console.log(`Owner: ${owner}`);
                console.log(`Is deployer owner: ${owner === deployer.address}`);
                
                const contractBalance = await hre.ethers.provider.getBalance(CONTRACT_ADDRESS);
                console.log(`Contract ETH balance: ${hre.ethers.utils.formatEther(contractBalance)}`);
                
                // Check exchange rates
                const ethToUsdc = await proxySwap.exchangeRates(hre.ethers.constants.AddressZero, USDC_ADDRESS);
                console.log(`ETH -> USDC rate: ${ethToUsdc.toString()}`);
                
                const usdcToEth = await proxySwap.exchangeRates(USDC_ADDRESS, hre.ethers.constants.AddressZero);
                console.log(`USDC -> ETH rate: ${usdcToEth.toString()}`);
                
            } catch (error) {
                console.log("❌ Error reading ProxySwap:", error.message);
            }
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
