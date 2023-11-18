const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy contract address on mainnet
const PROXY = "0x191b7D1CfA89c9389BbF5f7F49F4B8F93eC3740F";

async function main(){
    const erc721ABeanBasin = await ethers.getContractAt("ERC721ABeanBasin", PROXY);
    console.log("Upgrading BeaNFT Basin NFTs");
    // provide an upgrade list based on token IDs to upgrade
    const upgradeList = [1, 2, 4, 5, 6, 7, 8, 13, 14, 15, 16, 17, 20, 21, 23, 24, 25, 26, 27, 28, 32, 33, 34, 35, 36, 38, 39, 41, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 61, 62, 63, 65, 66, 67, 68, 69, 70, 71];
    await erc721ABeanBasin.upgradeNFTs(upgradeList);
    const tokenURI = await erc721ABeanBasin.tokenURI(1);
    console.log(tokenURI);
    console.log("BeaNFT Basin NFTs Upgraded");
}
main();