const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy address on mainnet
const PROXY = "0x191b7D1CfA89c9389BbF5f7F49F4B8F93eC3740F";

async function main(){
    // upgrade proxy
    const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
    console.log("Upgrading BeaNFT Basin...");
    const erc721BeanBasinV2 = await upgrades.upgradeProxy(PROXY, ERC721ABeanBasinV2);
    const v2address = await upgrades.erc1967.getImplementationAddress(PROXY);
    console.log("BeaNFT Basin Upgraded!");
    console.log("New Implmentation: ",v2address);
}
main();