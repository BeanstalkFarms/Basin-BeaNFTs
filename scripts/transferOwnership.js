const { ethers } = require('hardhat');
const fs = require('fs');

// deployed proxy contract address
const PROXY = "0x2681EeDAac1013631A4463786cd259f6c60f2DC3";
const newOwner = ""

async function main(){
    const erc721ABeanBasin = await ethers.getContractAt("ERC721ABeanBasin", PROXY);
    console.log("Transfering Ownership to: ", newOwner);
    // transfer ownership
    console.log("Old Owner: ", await erc721ABeanBasin.owner());
    await erc721ABeanBasin.transferOwnership(newOwner);
    console.log("New Owner: ", await erc721ABeanBasin.owner());
    console.log("Transfer Complete!");
}
main();