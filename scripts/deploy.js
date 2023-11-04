const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main () {
    const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
    console.log('Deploying...');
    const erc721ABasin = await upgrades.deployProxy(ERC721ABeanBasin,[
        'BeaNFT Basin Collection','BEANNFT',
        // first account of hardhat node
        ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
        [1]
    ],
    {kind: 'uups'});

    await erc721ABasin.waitForDeployment();

    console.log('Deployed to:', await erc721ABasin.getAddress());
    
    // const addresses = {
    //     proxy: ERC721ABeanBasinInstance.address,
    //     implementation: await upgrades.erc1967.getImplementationAddress(
    //         ERC721ABeanBasinInstance.address)
    // };
    // console.log('Addresses:', addresses);

    // try { 
    //     await run('verify', { address: addresses.implementation });
    // } catch (e) {}

    // fs.writeFileSync('deployment-addresses.json', JSON.stringify(addresses));
}

main();