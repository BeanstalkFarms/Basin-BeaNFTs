const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy contract address
const PROXY = "0x2681EeDAac1013631A4463786cd259f6c60f2DC3";

async function main(){
    const erc721ABeanBasin = await ethers.getContractAt("ERC721ABeanBasin", PROXY);
    console.log("Upgrading BeaNFT Basin NFTs");
    // provide an upgrade list based on token IDs to upgrade
    await erc721ABeanBasin.upgradeNFTs([0, 1 , 2 ,3]);
    const tokenURI = await erc721ABeanBasin.tokenURI(1);
    console.log(tokenURI);
    console.log("BeaNFT Basin NFTs Upgraded");
}
main();