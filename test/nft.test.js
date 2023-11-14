const { expect } = require('chai');
const { ethers } = require('hardhat');
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")

describe("ERC721ABeanBasin", function () {

  async function deployAndInit() {
    const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
    [owner, addr1, addr2 , addr3] = await ethers.getSigners();
    const erc721BeanBasin = await upgrades.deployProxy(ERC721ABeanBasin,[
        'BeaNFT Basin Collection','BEANNFT',
        [addr1.address, addr2.address],
        [1 , 2]
    ],
    {kind: 'uups'});
    await erc721BeanBasin.waitForDeployment();

    return { erc721BeanBasin, owner, addr1, addr2 , addr3 };
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
    expect(await erc721BeanBasin.baseURI()).to.equal('ipfs://QmT5roBqPD9cQX8pPFVmLygGPBdw3gY2azqYDeCT6YHsnw/');
  });

  it("Should return the correct token URI for an existing token", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    const tokenURI = await erc721BeanBasin.tokenURI(1);
    console.log("Initial URI");
    console.log(tokenURI);
    expect(tokenURI).to.equal('ipfs://QmT5roBqPD9cQX8pPFVmLygGPBdw3gY2azqYDeCT6YHsnw/1.json');
  });

  it("Should not return a token URI for a nonexistent token", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    await expect(erc721BeanBasin.tokenURI(3)).to.be.revertedWithCustomError(erc721BeanBasin,"URIQueryForNonexistentToken")
  });

  it("Should get number minted", async function () {
    const { erc721BeanBasin, addr1 , addr2 } = await loadFixture(deployAndInit);
    const numberMinted = await erc721BeanBasin.numberMinted(addr2.address);
    await expect(numberMinted).to.equal(2);
  });

  // it("Should burn an NFT", async function () {
  //   const { erc721BeanBasin, owner, addr1, addr2 } = await loadFixture(deployAndInit);
  //   const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  //   // approve first (transfer to zero address)
  //   await erc721BeanBasin.connect(addr1).approve(ZERO_ADDRESS, 1);
  //   // then burn
  //   await erc721BeanBasin.connect(addr1).burn(1);
  //   expect(await erc721BeanBasin.balanceOf(addr1.address)).to.equal(0);
  // });

  it("Should upgrade NFTs with easter egg", async function () {
    const { erc721BeanBasin, owner, addr1, addr2 } = await loadFixture(deployAndInit);
    console.log("Initial URI");
    let tokenURI = await erc721BeanBasin.tokenURI(1);
    console.log(tokenURI);
    await erc721BeanBasin.upgradeNFTs([1]);
    tokenURI = await erc721BeanBasin.tokenURI(1);
    expect(tokenURI).equal("ipfs://QmXQd2bpwZTtDst3eaGcCHEv13yzanbKsBuvuZhzXKs15a/1.json");
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

  it("Should get the correct total minted", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.totalMinted()).to.equal(3);
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

  it("Mints nfts correctly after deployment only by owner", async function () {
    const { erc721BeanBasin , addr3 } = await loadFixture(deployAndInit);
    // simple mint
    await erc721BeanBasin.mint(addr3.address, 1);
    expect(await erc721BeanBasin.ownerOf(3)).to.equal(addr3.address);
    // total supply
    expect(await erc721BeanBasin.totalSupply()).to.equal(4);
    // test only owner can mint
    await expect(erc721BeanBasin.connect(addr3).mint(addr3.address, 1)).to.be.revertedWithCustomError(erc721BeanBasin,"OwnableUnauthorizedAccount");
  });

});
