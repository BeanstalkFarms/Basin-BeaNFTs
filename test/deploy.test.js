const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("ERC721ABeanBasin Deployment test", function () {
  
    it("Should deploy properly", async function () {
      const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
      [owner, addr1, addr2] = await ethers.getSigners();
      const erc721BeanBasin = await upgrades.deployProxy(ERC721ABeanBasin,[
          'BeaNFT Basin Collection','BEANNFT',
          [addr1.address, addr2.address, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', '0x90f79bf6eb2c4f870365e785982e1f101e93b906'],
          [1 , 2 , 3 ,4 ,5 , 30]
      ],
      {kind: 'uups'});
      await erc721BeanBasin.waitForDeployment();
      const proxyAddress = await erc721BeanBasin.getAddress();
      const v1Address = await upgrades.erc1967.getImplementationAddress(proxyAddress);
      expect(proxyAddress).to.not.equal(v1Address);      
  
    });

});
