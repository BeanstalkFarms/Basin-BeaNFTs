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
    expect(await erc721BeanBasin.baseURI()).to.equal('ipfs://QmaU78pvAub1QCKCtUxGxaz7VRHSPg7GG6wHEDcGABS8ha/');
  });

  it("Should return the correct token URI for an existing token", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    const tokenURI = await erc721BeanBasin.tokenURI(1);
    console.log("Initial URI");
    console.log(tokenURI);
    expect(tokenURI).to.equal('ipfs://QmaU78pvAub1QCKCtUxGxaz7VRHSPg7GG6wHEDcGABS8ha/1.json');
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
    await erc721BeanBasin.upgradeNFTs([1]);
    const tokenURI = await erc721BeanBasin.tokenURI(1);
    expect(tokenURI).equal("ipfs://Qmdav3rKV6fSt15CjX2QyLnzPAjeJNndH6wRn7v9gQ7Yy7/1.json");
    console.log("Upgraded URI");
    console.log(tokenURI);
  });

  it("Should get the correct next tokenId", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.nextTokenId()).to.equal(3);
  });

  it("Should get the correct total supply", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.totalSupply()).to.equal(3);
  });

  it("Check if nft exists corrctly", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.exists(0)).to.equal(true);
    expect(await erc721BeanBasin.exists(5)).to.equal(false);
  });

  it("Transfers nft correctly", async function () {
    const { erc721BeanBasin, addr1, addr2 } = await loadFixture(deployAndInit);
    // since the caller is "from" , no need to approve
                                                        // FROM         TO          TOKENID 
    await erc721BeanBasin.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 0);
    expect(await erc721BeanBasin.ownerOf(0)).to.equal(addr2.address);
  });

});
