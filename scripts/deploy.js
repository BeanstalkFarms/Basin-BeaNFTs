const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main () {
    const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
    console.log('Deploying...');
    const erc721ABasin = await upgrades.deployProxy(ERC721ABeanBasin,[
        'BeaNFT Basin Collection','BEANNFT',
    ],
    {kind: 'uups'});

    await erc721ABasin.waitForDeployment();

    proxyAddress = await erc721ABasin.getAddress();
    implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log('Proxy address:', proxyAddress);
    console.log('Implementation address: ', implementationAddress);

    const addresses = {
        proxyAddress: proxyAddress,
        implementationAddress: implementationAddress
    }
    
    fs.writeFileSync('deployment-addresses-sepolia.json', JSON.stringify(addresses));
}

main();