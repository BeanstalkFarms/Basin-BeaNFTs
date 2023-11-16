const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

// proxy address to upgrade
const PROXY = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

async function main(){
    const ERC721ABeanBasinV2 = await ethers.getContractFactory("MockERC721ABeanBasinV2");
    await upgrades.upgradeProxy(PROXY, ERC721ABeanBasinV2);
    console.log("Upgrading BeaNFT Basin");
    const v2address = await upgrades.erc1967.getImplementationAddress(PROXY);
    console.log("BeaNFT Basin Upgraded");
    
    console.log("New Implmentation:",v2address);

    try { 
        await run('verify', { address: impl });
    } catch (e) {}

}
main();