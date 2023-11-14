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

    it("Should batch mint (51 addresses , 71 nfts) ideal sequential", async function () {
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
  
    it("Should batch mint (51 addresses , 71 nfts) realistic", async function () {
      const { mockBatchMint } = await loadFixture(deployAndInit);
      
      const nft_amount = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      const addressArray = ['0xa92ab746eac03e5ec31cd3a879014a7d1e04640c', '0x36998db3f9d958f0ebaef7b0b6bf11f3441b216f', '0xa36aa9dbdb7bbc2c986a5e30386a057f8aa38d9c', '0x34a649fde43ce36882091a010aae2805a9fcff0d', '0x43a9da9bade357843fbe7e5ee3eedd910f9fac1e', '0x340bc7511e4e6c1cdd9dcd8f02827fd08edc6fb2', '0x9d840dccb22e781e7f223ada4dc49e6734d2ce17', '0x4cc19a7a359f2ff54ff087f03b6887f436f08c11', '0x56a201b872b50bbdee0021ed4d1bb36359d291ed', '0xe3cd19fabc17ba4b3d11341aa06b6f245de3f9a6', '0x7aaee144a14ec3ba0e468c9dcf4a89fdb62c5aa6', '0x0b8e605a7446801ae645e57de5aabbc251cd1e3c', '0x56a201b872b50bbdee0021ed4d1bb36359d291ed', '0x7aaee144a14ec3ba0e468c9dcf4a89fdb62c5aa6', '0x7b2366996a64effe1af089fa64e9cf4361fddc6e', '0x56a201b872b50bbdee0021ed4d1bb36359d291ed', '0x9a00beffa3fc064104b71f6b7ea93babdc44d9da', '0x34a649fde43ce36882091a010aae2805a9fcff0d', '0xc19cf05f28bd4fd58e427a60ec9416d73b6d6c57', '0x8d9261369e3bfba715f63303236c324d2e3c44ec', '0xa9a01cf812da74e3100e1fb9b28224902d403ed7', '0x4bf44e0c856d096b755d54ca1e9cfdc0115ed2e6', '0x9ec255f1af4d3e4a813aadab8ff0497398037d56', '0xc19cf05f28bd4fd58e427a60ec9416d73b6d6c57', '0xf05b641229bb2aa63b205ad8b423a390f7ef05a7', '0x14f78bdcccd12c4f963bd0457212b3517f974b2b', '0xde3e4d173f754704a763d39e1dcf0a90c37ec7f0', '0x5b45b0a5c1e3d570282bddfe01b0465c1b332430', '0x59229efd5206968301ed67d5b08e1c39e0179897', '0xe543357d4f0eb174cfc6bed6ef5e7ab5762f1b2b', '0x56a201b872b50bbdee0021ed4d1bb36359d291ed', '0x41dd131e460e18befd262cf4fe2e2b2f43f6fb7b', '0xb345720ab089a6748ccec3b59caf642583e308bf', '0xddfe74f671f6546f49a6d20909999cfe5f09ad78', '0x4c180462a051ab67d8237ede2c987590df2fbbe6', '0xd6e91233068c81b0eb6aac77620641f72d27a039', '0xb345720ab089a6748ccec3b59caf642583e308bf', '0x394c357db3177e33bde63f259f0eb2c04a46827c', '0x7211eead6c7db1d1ebd70f5cbcd8833935a04126', '0xc7c1b169a8d3c5f2d6b25642c4d10da94ffcd3c9', '0xe3cd19fabc17ba4b3d11341aa06b6f245de3f9a6', '0xbc4de0a59d8af0af3e66e08e488400aa6f8bb0fb', '0xf9d183af486a973b7921ceb5fdc9908d12aab440', '0xe3cd19fabc17ba4b3d11341aa06b6f245de3f9a6', '0x8d9261369e3bfba715f63303236c324d2e3c44ec', '0x9a00beffa3fc064104b71f6b7ea93babdc44d9da', '0xf9d183af486a973b7921ceb5fdc9908d12aab440', '0x00d1ebe373806b2e5a3db01903aa777ff3f4471d', '0xe2cdf066eee46b2c424dd1894b8ae33f153f533c', '0xe3cd19fabc17ba4b3d11341aa06b6f245de3f9a6', '0x3d7cde7ea3da7fdd724482f11174cbc0b389bd8b', '0x14f78bdcccd12c4f963bd0457212b3517f974b2b', '0x9401676cd2d01e02a97fcf1f567a369bbae37f0c', '0x56a201b872b50bbdee0021ed4d1bb36359d291ed', '0xbaec6ed4a9c3b333e1cb20c3e729d7100c85d8f1', '0x8d9261369e3bfba715f63303236c324d2e3c44ec', '0x4c180462a051ab67d8237ede2c987590df2fbbe6', '0x56a201b872b50bbdee0021ed4d1bb36359d291ed', '0x69e02d001146a86d4e2995f9ecf906265aa77d85', '0xc1f80163cc753f460a190643d8fcbb7755a48409', '0x3d138e67dfac9a7af69d2694470b0b6d37721b06', '0x9832ee476d66b58d185b7bd46d05cbcbe4e543e1', '0x43a9da9bade357843fbe7e5ee3eedd910f9fac1e', '0xb0b822e1c3995503442682caeea1b6c683169d2e', '0x1b7ea7d42c476a1e2808f23e18d850c5a4692df7', '0x14f78bdcccd12c4f963bd0457212b3517f974b2b', '0xd441c97ef1458d847271f91714799007081494ef', '0xb3f3658bf332ba6c9c0cc5bc1201caba7ada819b', '0xf1a621fe077e4e9ac2c0cefd9b69551db9c3f657', '0x9a428d7491ec6a669c7fe93e1e331fe881e9746f', '0x1348ea8e35236aa0769b91ae291e7291117bf15c']

      await mockBatchMint.__batchMintAllInit(addressArray, nft_amount);
      expect(await mockBatchMint.nextTokenId()).to.equal(72);
  });
});