const { ethers } = require('hardhat');
const fs = require('fs');

// deployed proxy contract address on mainnet
const PROXY = "0x191b7D1CfA89c9389BbF5f7F49F4B8F93eC3740F";
// beanft dao address
const newOwner = "0x2D92a7Ba42472001111C1A1614EF6A8737bDf278"

async function main(){
    const erc721ABeanBasinV2 = await ethers.getContractAt("ERC721ABeanBasinV2", PROXY);
    console.log("Transfering Ownership to: ", newOwner);
    // transfer ownership
    console.log("Old Owner: ", await erc721ABeanBasinV2.owner());
    await erc721ABeanBasinV2.transferOwnership(newOwner);
    console.log("New Owner: ", await erc721ABeanBasinV2.owner());
    console.log("Transfer Complete!");
}
main();