const { expect } = require('chai');
const { ethers } = require('hardhat');
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")

describe("ERC721ABeanBasin", function () {

  async function deployAndInit() {
    const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
    [owner, addr1 , addr2 , addr3] = await ethers.getSigners();
    const whitelisted1 = "0xA92aB746eaC03E5eC31Cd3A879014a7D1e04640c"
    const whitelisted2 = "0xC19cF05F28BD4fd58E427a60EC9416d73B6d6c57"
    const whitelisted3 = "0x56A201b872B50bBdEe0021ed4D1bb36359D291ED"

    const erc721BeanBasin = await upgrades.deployProxy(ERC721ABeanBasin,[
        'BeaNFT Basin Collection','BEANNFT',
    ],
    {kind: 'uups'});
    await erc721BeanBasin.waitForDeployment();

    return { erc721BeanBasin, owner, addr1, addr2 , addr3 , whitelisted1 , whitelisted2 , whitelisted3 };
  };

  it("Should initialize the contract with the correct name and symbol", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.name()).to.equal("BeaNFT Basin Collection");
    expect(await erc721BeanBasin.symbol()).to.equal("BEANNFT");
  });

  it("Should mint NFTs to the specified first 3 addresses in the deployment array", async function () {
    const { erc721BeanBasin, whitelisted1 , whitelisted2 , whitelisted3 } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.ownerOf(0)).to.equal(whitelisted1);
    expect(await erc721BeanBasin.ownerOf(1)).to.equal(whitelisted2);
    expect(await erc721BeanBasin.ownerOf(2)).to.equal(whitelisted3);
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
    await expect(erc721BeanBasin.tokenURI(73)).to.be.revertedWithCustomError(erc721BeanBasin,"URIQueryForNonexistentToken")
  });

  it("Should get number minted", async function () {
    const { erc721BeanBasin, whitelisted2} = await loadFixture(deployAndInit);
    const numberMinted = await erc721BeanBasin.numberMinted(whitelisted2);
    // address 2 has 2 nfts
    await expect(numberMinted).to.equal(2);
  });

  // it("Should burn an NFT of owner", async function () {
  //   const { erc721BeanBasin, owner, whitelisted1} = await loadFixture(deployAndInit);
  //   // burn works, even after approval ckeck because whitelisted1 is the owner of the token being burned
  //   const whitelisted1Signer = await ethers.provider.getSigner(whitelisted1)
  //   await erc721BeanBasin.connect(whitelisted1Signer).burn(0);
  //   expect(await erc721BeanBasin.balanceOf(whitelisted1)).to.equal(0);
  //   expect(await erc721BeanBasin.totalBurned()).to.equal(1);
  // });

  it("Should not burn an NFT of non owner", async function () {
    const { erc721BeanBasin, addr1} = await loadFixture(deployAndInit);
    // addr1 is not the owner of the token being burned so it should revert
    await expect(erc721BeanBasin.connect(addr1).burn(1)).to.be.revertedWithCustomError(erc721BeanBasin,"TransferCallerNotOwnerNorApproved");
  });

  it("Should upgrade NFTs with easter egg", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
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
    expect(await erc721BeanBasin.nextTokenId()).to.equal(72);
  });

  it("Should get the correct total supply", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.totalSupply()).to.equal(72);
  });

  it("Should get the correct total minted", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.totalMinted()).to.equal(72);
  });

  it("Check if nft exists corrctly", async function () {
    const { erc721BeanBasin } = await loadFixture(deployAndInit);
    expect(await erc721BeanBasin.exists(0)).to.equal(true);
    expect(await erc721BeanBasin.exists(73)).to.equal(false);
  });

  // it("Transfers nft correctly", async function () {
  //   const { erc721BeanBasin, whitelisted1, addr2 } = await loadFixture(deployAndInit);
  //   // since the caller is "from" , no need to approve
  //                                                       // FROM         TO          TOKENID 
  //   await erc721BeanBasin.connect(whitelisted1).safeTransferFrom(whitelisted1, addr2.address, 0);
  //   expect(await erc721BeanBasin.ownerOf(0)).to.equal(addr2.address);
  // });

  it("Mints nfts correctly after deployment only by owner", async function () {
    const { erc721BeanBasin , owner, addr1, addr3 } = await loadFixture(deployAndInit);
    // simple mint
    await erc721BeanBasin.mint(addr3, 1);
    expect(await erc721BeanBasin.ownerOf(72)).to.equal(addr3.address);
    // total supply
    expect(await erc721BeanBasin.totalSupply()).to.equal(73);
    // test only owner can mint
    await expect(erc721BeanBasin.connect(addr3).mint(addr1, 1)).to.be.revertedWithCustomError(erc721BeanBasin,"OwnableUnauthorizedAccount");
  });

});
