const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")


describe("ERC721ABeanBasin Proxy Upgrade", function () {
    
    // reproduce current deployed contract state
    async function deployAndInit() {
      const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
      [owner, addr1, addr2] = await ethers.getSigners();
      const erc721BeanBasin = await upgrades.deployProxy(ERC721ABeanBasin,[
          'BeaNFT Basin Collection','BEANNFT',
      ],
      {kind: 'uups'});
      await erc721BeanBasin.waitForDeployment();
      const proxyAddress = await erc721BeanBasin.getAddress();
      const v1Address = await upgrades.erc1967.getImplementationAddress(proxyAddress);

      const upgradeList = [1, 2, 4, 5, 6, 7, 8, 13, 14, 15, 16, 17, 20, 21, 23, 24, 25, 26, 27, 28, 32, 33, 34, 35, 36, 38, 39, 41, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 61, 62, 63, 65, 66, 67, 68, 69, 70, 71];
      await erc721BeanBasin.upgradeNFTs(upgradeList);
  
      return { erc721BeanBasin, proxyAddress, v1Address,  owner, addr1, addr2 };
    };

    it("Should upgrade the contract to a new implementation", async function () {
        const { erc721BeanBasin , proxyAddress , v1Address } = await loadFixture(deployAndInit);
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        const v2address = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("v1 Implementation Address: ", v1Address);
        console.log("v2 Implementation Address: ", v2address);
        expect(v1Address).to.not.equal(v2address);
    });

    it("Should retain state", async function () {
        const { erc721BeanBasin , proxyAddress } = await loadFixture(deployAndInit);
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        expect(await erc721BeanBasinV2.name()).to.equal("BeaNFT Basin Collection");
        expect(await erc721BeanBasinV2.symbol()).to.equal("BEANNFT");
        expect(await erc721BeanBasinV2.totalSupply()).to.equal(72);
        expect(await erc721BeanBasinV2.nextTokenId()).to.equal(72);
        expect(await erc721BeanBasinV2.totalMinted()).to.equal(72);
        expect(await erc721BeanBasinV2.exists(0)).to.equal(true);
        expect(await erc721BeanBasinV2.exists(73)).to.equal(false);
        // get upgraded nfts
        expect(await erc721BeanBasinV2.isNFTUpgraded(1)).to.equal(true);
        expect(await erc721BeanBasinV2.isNFTUpgraded(15)).to.equal(true);
        // tokenuri before init
        expect(await erc721BeanBasinV2.tokenURI(0)).to.equal("");
    });

    it("Should set baseUris only by owner", async function () {
        const { erc721BeanBasin , proxyAddress , addr1 } = await loadFixture(deployAndInit);
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        await erc721BeanBasinV2.setBaseUri("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/");
        await erc721BeanBasinV2.setUpgradedBaseUri("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/");
        expect(await erc721BeanBasinV2.baseUri()).to.equal("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/");
        expect(await erc721BeanBasinV2.upgradedBaseUri()).to.equal("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/");
        await expect(erc721BeanBasinV2.connect(addr1).setBaseUri("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/")).to.be.revertedWithCustomError(erc721BeanBasinV2,"OwnableUnauthorizedAccount");
    });

    it("Should return correct new urls for existing tokens", async function () {
        const { erc721BeanBasin , proxyAddress , addr1 } = await loadFixture(deployAndInit);
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        // set base uris
        await erc721BeanBasinV2.setBaseUri("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/");
        await erc721BeanBasinV2.setUpgradedBaseUri("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/");
        // state is retained so no need to upgrade nfts again
        // non upgraded
        expect(await erc721BeanBasinV2.isNFTUpgraded(0)).to.equal(false);
        expect(await erc721BeanBasinV2.tokenURI(0)).to.equal("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/0.json");
        // upgraded
        expect(await erc721BeanBasinV2.isNFTUpgraded(1)).to.equal(true);
        expect(await erc721BeanBasinV2.tokenURI(1)).to.equal("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/1.json");
    });


    it("Should mint new tokens as previously", async function () {
        const { erc721BeanBasin , proxyAddress , addr1 } = await loadFixture(deployAndInit);
        // upgrade
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        // set base uris
        await erc721BeanBasinV2.setBaseUri("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/");
        await erc721BeanBasinV2.setUpgradedBaseUri("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/");
        // mint
        await erc721BeanBasinV2.mint(addr1.address, 1);
        // supply checks
        expect(await erc721BeanBasinV2.totalSupply()).to.equal(73);
        expect(await erc721BeanBasinV2.nextTokenId()).to.equal(73);
        expect(await erc721BeanBasinV2.totalMinted()).to.equal(73);
        // tokenUri 
        expect(await erc721BeanBasinV2.tokenURI(72)).to.equal("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/72.json");
        // owner
        expect(await erc721BeanBasinV2.ownerOf(72)).to.equal(addr1.address);
        // upgrade and recheck tokenuri
        await erc721BeanBasinV2.upgradeNFTs([72]);
        expect(await erc721BeanBasinV2.tokenURI(72)).to.equal("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/72.json");
    });

    it("Fixes realistic scenario", async function () {
        const { erc721BeanBasin , proxyAddress } = await loadFixture(deployAndInit);
        // upgrade
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        // set base uris
        await erc721BeanBasinV2.setBaseUri("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/");
        await erc721BeanBasinV2.setUpgradedBaseUri("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/");
        // mint
        const missed_addresses = ["0x68572eacf9e64e6dcd6bb19f992bdc4eff465fd0" , "0x9a00beffa3fc064104b71f6b7ea93babdc44d9da"]
        await erc721BeanBasinV2.mint(missed_addresses[0], 1);
        await erc721BeanBasinV2.mint(missed_addresses[1], 4);
        // supply checks
        expect(await erc721BeanBasinV2.totalSupply()).to.equal(77);
        expect(await erc721BeanBasinV2.nextTokenId()).to.equal(77);
        expect(await erc721BeanBasinV2.totalMinted()).to.equal(77);
        // tokenUri 
        expect(await erc721BeanBasinV2.tokenURI(72)).to.equal("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/72.json");
        expect(await erc721BeanBasinV2.tokenURI(76)).to.equal("ipfs://QmNk24JoLMH9SHWLG7SR9aYVTDUyC1F2pBvy5sdTjSZEoW/76.json");
        // owner
        expect(await erc721BeanBasinV2.ownerOf(72)).to.equal("0x68572eAcf9E64e6dCD6bB19f992Bdc4Eff465fd0");
        expect(await erc721BeanBasinV2.ownerOf(76)).to.equal("0x9A00BEFfa3fc064104b71f6B7EA93bAbDC44D9dA");
        // upgrade and recheck tokenuri
        await erc721BeanBasinV2.upgradeNFTs([72 , 73 , 74 , 75 , 76]);
        expect(await erc721BeanBasinV2.tokenURI(72)).to.equal("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/72.json");
        expect(await erc721BeanBasinV2.tokenURI(76)).to.equal("ipfs://QmSRa8EMDJqrhyHc4xcnfWadakr4c2gvUdMVNRp72dqyXe/76.json");
    });

    it("Should be able to re-upgrade", async function () {
        const { erc721BeanBasin , proxyAddress , addr1 } = await loadFixture(deployAndInit);
        // upgrade
        const ERC721ABeanBasinV2 = await ethers.getContractFactory("ERC721ABeanBasinV2");
        const erc721BeanBasinV2 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV2);
        // re-upgrade
        const ERC721ABeanBasinV3 = await ethers.getContractFactory("MockERC721ABeanBasinV2");
        const erc721BeanBasinV3 = await upgrades.upgradeProxy(proxyAddress, ERC721ABeanBasinV3); 
    });


    

});