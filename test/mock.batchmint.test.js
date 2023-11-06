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
  
    it("Should batch mint (51 addresses , 71 nfts)", async function () {
        const { mockBatchMint , addressArray } = await loadFixture(deployAndInit);
        const nft_amount = new Array(51).fill(1);
        // fill last 20 places of array with 2 (+ 20 nfts)
        nft_amount.fill(2, 31, 51);
        // get sum of all nfts
        const sum = nft_amount.reduce((a, b) => a + b, 0);
        console.log(sum);

        await mockBatchMint.__batchMintAllInit(addressArray, nft_amount);
        expect(await mockBatchMint.nextTokenId()).to.equal(71);
    });
});