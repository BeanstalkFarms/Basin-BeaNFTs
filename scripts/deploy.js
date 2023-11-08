const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main () {
    const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
    console.log('Deploying...');
    const erc721ABasin = await upgrades.deployProxy(ERC721ABeanBasin,[
        'BeaNFT Basin Collection','BEANNFT',
        // first account of hardhat node
        ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' , '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'],
        [1 , 3]
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
    
    fs.writeFileSync('deployment-addresses.json', JSON.stringify(addresses));
}

main();