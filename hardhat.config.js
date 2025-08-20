require("dotenv/config");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.17",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.7.6",
        settings: { optimizer: { enabled: true, runs: 200 } },
      }
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000", // 10000 ETH per account
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/07818f3d4fa54707c26200df522d4863",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY && 
        process.env.DEPLOYER_PRIVATE_KEY !== "your_private_key_here" &&
        process.env.DEPLOYER_PRIVATE_KEY.length === 64
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.infura.io/v3/07818f3d4fa54707c26200df522d4863",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY && 
        process.env.DEPLOYER_PRIVATE_KEY !== "your_private_key_here" &&
        process.env.DEPLOYER_PRIVATE_KEY.length === 64
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
      chainId: 1,
    },
  },
};

module.exports = config;
