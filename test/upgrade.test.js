const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")


describe("ERC721ABeanBasin Proxy Upgrade", function () {
  
    async function deployAndInit() {
      const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
      [owner, addr1, addr2] = await ethers.getSigners();
      const erc721BeanBasin = await upgrades.deployProxy(ERC721ABeanBasin,[
          'BeaNFT Basin Collection','BEANNFT',
          [addr1.address, addr2.address],
          [1 , 2]
      ],
      {kind: 'uups'});
      await erc721BeanBasin.waitForDeployment();
      const proxyAddress = await erc721BeanBasin.getAddress();
      const v1Address = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  
      return { erc721BeanBasin, proxyAddress, v1Address,  owner, addr1, addr2 };
    };

    it("Should upgrade the contract to a new implementation", async function () {
        const { erc721BeanBasin , proxyAddress , v1Address } = await loadFixture(deployAndInit);
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("MockERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        const v2address = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("v1 Implementation Address: ", v1Address);
        console.log("v2 Implementation Address: ", v2address);
        expect(v1Address).to.not.equal(v2address);
        expect(await erc721BeanBasinV2.baseURI()).to.equal("BASEURIV2");
    });

    it("Should upgrade to the correct contract", async function () {
        const { erc721BeanBasin , proxyAddress } = await loadFixture(deployAndInit);
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("MockERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        expect(await erc721BeanBasinV2.baseURI()).to.equal("BASEURIV2");
    });

});