const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy address
const PROXY = "0x191b7D1CfA89c9389BbF5f7F49F4B8F93eC3740F";

async function main(){
    const erc721BeanBasinV2 = await ethers.getContractAt("ERC721ABeanBasinV2",PROXY);
    // set correct uris
    console.log("Setting Base URIs...");
    await erc721BeanBasinV2.setBaseUri("ipfs://QmRpSmUuwDudz5b5t67nwwv54FbShNtCSnTDBUC5EgWzQp/");
    await erc721BeanBasinV2.setUpgradedBaseUri("ipfs://QmfJawXZuFobPJchdQiVZS3Cf9MpK7VrbtG2i9597GHPbh/");
    // mint new nfts
    console.log("Minting New NFTs...");
    const missed_address = "0x193641EA463C3B9244cF9F00b77EE5220d4154e9"
    await erc721BeanBasinV2.mint(missed_address, 1);
    // upgrade new nfts as needed
    console.log("Upgrading new NFTs...");
    await erc721BeanBasinV2.upgradeNFTs([77]);
    console.log("Process Completed!");
}
main();