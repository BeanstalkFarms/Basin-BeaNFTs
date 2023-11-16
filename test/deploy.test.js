const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("ERC721ABeanBasin Deployment test", function () {
  
    it("Should deploy properly", async function () {
      const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
      [owner, addr1, addr2] = await ethers.getSigners();
      const erc721BeanBasin = await upgrades.deployProxy(ERC721ABeanBasin,[
          'BeaNFT Basin Collection','BEANNFT',
      ],
      {kind: 'uups'});
      await erc721BeanBasin.waitForDeployment();
      const proxyAddress = await erc721BeanBasin.getAddress();
      const v1Address = await upgrades.erc1967.getImplementationAddress(proxyAddress);
      expect(proxyAddress).to.not.equal(v1Address);      
  
    });

});
