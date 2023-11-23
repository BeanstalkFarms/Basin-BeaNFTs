const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy address
const PROXY = "0xe21743a5F411976957EdeF79d5a55c954eb4b605";

async function main(){
    const erc721BeanBasinV2 = await ethers.getContractAt("ERC721ABeanBasinV2",PROXY);
    // set correct uris
    console.log("Setting Base URIs...");
    await erc721BeanBasinV2.setBaseUri("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/");
    await erc721BeanBasinV2.setUpgradedBaseUri("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/");
    // mint new nfts
    console.log("Minting New NFTs...");
    const missed_addresses = ["0x68572eacf9e64e6dcd6bb19f992bdc4eff465fd0" , "0x9a00beffa3fc064104b71f6b7ea93babdc44d9da"]
    await erc721BeanBasinV2.mint(missed_addresses[0], 1);
    await erc721BeanBasinV2.mint(missed_addresses[1], 4);
    // upgrade new nfts
    console.log("Upgrading new NFTs...");
    await erc721BeanBasinV2.upgradeNFTs([72 , 73 , 74 , 75 , 76]);
    console.log("Process Completed!");
}
main();