const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// deployed proxy address
const PROXY = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main(){
    // upgrade proxy
    const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
    const erc721BeanBasinV2 = await upgrades.upgradeProxy(PROXY, ERC721ABeanBasinV2);
    console.log("Upgrading BeaNFT Basin");
    const v2address = await upgrades.erc1967.getImplementationAddress(PROXY);
    console.log("BeaNFT Basin Upgraded");
    console.log("New Implmentation:",v2address);
    // set correct uris
    console.log("Setting Base URIs");
    await erc721BeanBasinV2.setBaseUri("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/");
    await erc721BeanBasinV2.setUpgradedBaseUri("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/");
    // mint new nfts
    console.log("Minting New NFTs");
    const missed_addresses = ["0x68572eacf9e64e6dcd6bb19f992bdc4eff465fd0" , "0x9a00beffa3fc064104b71f6b7ea93babdc44d9da"]
    await erc721BeanBasinV2.mint(missed_addresses[0], 1);
    await erc721BeanBasinV2.mint(missed_addresses[1], 4);
    // upgrade and recheck tokenuri
    console.log("Upgrading new NFTs");
    await erc721BeanBasinV2.upgradeNFTs([72 , 73 , 74 , 75 , 76]);
}
main();