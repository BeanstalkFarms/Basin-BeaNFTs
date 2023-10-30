const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main () {
    const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
    console.log('Deploying...');
    const erc721 = await upgrades.deployProxy(ERC721ABeanBasin,[
        'BeaNFT Basin Collection','BEANNFT',
        ['0x735cab9b02fd153174763958ffb4e0a971dd7f29']
        [7]
    ],
    {kind: 'uups'});
    await erc721.deployed();
    const addresses = {
        proxy: erc721.address,
        implementation: await upgrades.erc1967.getImplementationAddress(
            erc721.address)
    };
    console.log('Addresses:', addresses);

    try { 
        await run('verify', { address: addresses.implementation });
    } catch (e) {}

    fs.writeFileSync('deployment-addresses.json', JSON.stringify(addresses));
}

main();