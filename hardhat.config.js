require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL  || 'https://rpc.sepolia.org',
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      allowUnlimitedContractSize: true
    }
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 20,
    enabled: (process.env.REPORT_GAS) ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    noColors: true,
    outputFile: "gas-report_full.txt"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
