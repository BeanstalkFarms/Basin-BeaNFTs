const { ethers } = require('hardhat');
const fs = require('fs');

// deployed proxy contract address on mainnet
const PROXY = "0x191b7D1CfA89c9389BbF5f7F49F4B8F93eC3740F";
// beanft dao address
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