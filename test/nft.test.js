const { expect } = require('chai');
const { ethers } = require('hardhat');
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")

describe("ERC721ABeanBasin", function () {

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

    return { erc721BeanBasin, owner, addr1, addr2 };
  };

  it("Should initialize the contract with the correct name and symbol", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.name()).to.equal("BeaNFT Basin Collection");
    expect(await erc721BeanBasin.symbol()).to.equal("BEANNFT");
  });

  it("Should mint NFTs to the specified addresses", async function () {
    const { erc721BeanBasin, addr1, addr2 } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.ownerOf(0)).to.equal(addr1.address);
    expect(await erc721BeanBasin.ownerOf(1)).to.equal(addr2.address);
    expect(await erc721BeanBasin.ownerOf(2)).to.equal(addr2.address);
  });

  it("Should return the correct base URI", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.baseURI()).to.equal("https://ipfs.io/ipfs/QmP7tAHsiLTgtn2TLekG9HWhfLdHFgk6HSnYnBhGK3xxFB/");
  });

  it("Should return the correct token URI for an existing token", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    const tokenURI = await erc721BeanBasin.tokenURI(1);
    expect(tokenURI).to.equal("https://ipfs.io/ipfs/QmP7tAHsiLTgtn2TLekG9HWhfLdHFgk6HSnYnBhGK3xxFB/1");
  });

  it("Should not return a token URI for a nonexistent token", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    await expect(erc721BeanBasin.tokenURI(3)).to.be.revertedWithCustomError(erc721BeanBasin,"URIQueryForNonexistentToken")
  });

  it("Should burn an NFT", async function () {
    const { erc721BeanBasin, owner, addr1, addr2 } = await loadFixture(deployAndInit);
    await erc721BeanBasin.burn(1);
    expect(await erc721BeanBasin.balanceOf(owner.address)).to.equal(0);
  });

  it("Should upgrade NFTs with easter egg", async function () {
    const { erc721BeanBasin, owner, addr1, addr2 } = await loadFixture(deployAndInit);
    await erc721BeanBasin.upgradeNFTs([2]);
    const tokenURI = await erc721BeanBasin.tokenURI(2);
    expect(tokenURI).equal("upgradedURI2");
  });

  it("Should get the correct next tokenId", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.nextTokenId()).to.equal(3);
  });

  it("Should get the correct total supply", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.totalSupply()).to.equal(3);
  });

});
