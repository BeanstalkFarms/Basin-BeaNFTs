const { expect } = require('chai');
const { ethers } = require('hardhat');
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")

describe("ERC721ABeanBasin batch mint test for gas estimation", function () {
  
    async function deployAndInit() {
      const MockBatchMint = await ethers.getContractFactory("MockBatchMint");
      [ owner, addr1, addr2 ] = await ethers.getSigners();
      let addressArray = [];
      //create 51 wallets
      for (let i = 0; i < 51; i++) {
        //create a new wallet
        let wallet = ethers.Wallet.createRandom()
        addressArray.push(wallet.address.toString());
      }
      const mockBatchMint = await upgrades.deployProxy(MockBatchMint,[
          'BeaNFT Basin Collection','BEANNFT',
      ],
      {kind: 'uups'});
      await mockBatchMint.waitForDeployment();
      const proxyAddress = await mockBatchMint.getAddress();
      const v1Address = await upgrades.erc1967.getImplementationAddress(proxyAddress);
      
      return { mockBatchMint, proxyAddress, v1Address,  owner, addr1, addr2 , addressArray} 
    };   
  
    it("Should batch mint (51 addresses , 71 nfts) realistic", async function () {
      const { mockBatchMint } = await loadFixture(deployAndInit);
      await mockBatchMint.___batchMintAllInit();
      expect(await mockBatchMint.nextTokenId()).to.equal(72);
  });
});