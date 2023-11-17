const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy contract address on mainnet
const PROXY = "0x191b7D1CfA89c9389BbF5f7F49F4B8F93eC3740F";

async function main(){
    const erc721ABeanBasin = await ethers.getContractAt("ERC721ABeanBasin", PROXY);
    console.log("Upgrading BeaNFT Basin NFTs");
    // provide an upgrade list based on token IDs to upgrade
    await erc721ABeanBasin.upgradeNFTs([0, 1]);
    const tokenURI = await erc721ABeanBasin.tokenURI(1);
    console.log(tokenURI);
    console.log("BeaNFT Basin NFTs Upgraded");
}
main();