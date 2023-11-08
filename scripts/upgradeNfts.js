const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy contract address
const PROXY = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

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