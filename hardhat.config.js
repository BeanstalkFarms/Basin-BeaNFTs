require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  gasReporter: {
    currency: "USD",
    gasPrice: 15,
    enabled: (process.env.REPORT_GAS) ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    onlyCalledMethods: true,
  }
};
