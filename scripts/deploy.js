// scripts/deploy.js

const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`Deploying ProxySwap to ${network}...`);

  // Получаем фабрику контракта
  const ProxySwap = await hre.ethers.getContractFactory("ProxySwap");

  // Адреса SwapRouter для разных сетей
  const SWAP_ROUTER_ADDRESSES = {
    mainnet: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    sepolia: "0xE592427A0AEce92De3Edee1F18E0157C05861564", 
    goerli: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    hardhat: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Мок для локальной сети
    localhost: "0xE592427A0AEce92De3Edee1F18E0157C05861564" // Мок для локальной сети
  };

  const swapRouterAddress = SWAP_ROUTER_ADDRESSES[network] || SWAP_ROUTER_ADDRESSES.mainnet;
  
  console.log(`Using SwapRouter at: ${swapRouterAddress}`);

  // Деплой
  const proxy = await ProxySwap.deploy(swapRouterAddress);
  await proxy.deployed();

  console.log("✅ ProxySwap deployed at:", proxy.address);
  console.log("📝 Update PROXY_SWAP_ADDRESS in constants.ts to:", proxy.address);
  
  // Для локальной сети выводим дополнительную информацию
  if (network === "hardhat" || network === "localhost") {
    console.log("\n🔧 Local development setup:");
    console.log("1. Update src/app/utils/constants.ts with the address above");
    console.log("2. Make sure Hardhat node is running");
    console.log("3. Connect MetaMask to http://localhost:8545 (Chain ID: 31337)");
    console.log("4. Import one of the Hardhat test accounts into MetaMask");
  }
}

// Стандартный обработчик ошибок
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
