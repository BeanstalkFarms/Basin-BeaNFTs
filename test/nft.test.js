const { expect } = require('chai');
const { ethers } = require('hardhat');
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers")

describe("ERC721ABeanBasin", function () {

  async function deployAndInit() {
    const ERC721ABeanBasin = await ethers.getContractFactory("ERC721ABeanBasin");
    [owner, addr1 , addr2 , addr3] = await ethers.getSigners();
    // first 3 whitelisted addresses 
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

  it("Should mint NFTs to the correct owners", async function () {
    const { erc721BeanBasin} = await loadFixture(deployAndInit);
    const addresses_array = ['0xA92aB746eaC03E5eC31Cd3A879014a7D1e04640c' ,'0xC19cF05F28BD4fd58E427a60EC9416d73B6d6c57' ,'0x56A201b872B50bBdEe0021ed4D1bb36359D291ED' ,'0x14F78BdCcCD12c4f963bd0457212B3517f974b2b' ,'0xb0B822e1c3995503442682CaEea1b6c683169D2e' ,'0x7AAEE144a14Ec3ba0E468C9Dcf4a89Fdb62C5AA6' ,'0xB345720Ab089A6748CCec3b59caF642583e308Bf' ,'0xa9a01Cf812DA74e3100E1fb9B28224902D403ed7' ,'0xF9D183AF486A973b7921ceb5FdC9908D12AAb440' ,'0x43a9dA9bAde357843fBE7E5ee3Eedd910F9fAC1e' ,'0x9A428d7491ec6A669C7fE93E1E331fe881e9746f' ,'0x14F78BdCcCD12c4f963bd0457212B3517f974b2b' ,'0x340bc7511E4E6C1cDD9dCd8f02827fd08EDC6Fb2' ,'0x56A201b872B50bBdEe0021ed4D1bb36359D291ED' ,'0xbC4de0a59D8aF0Af3e66e08e488400Aa6F8bB0FB' ,'0x9401676Cd2D01e02A97fcf1F567A369bBae37f0C' ,'0x56A201b872B50bBdEe0021ed4D1bb36359D291ED' ,'0xD6e91233068c81b0eB6aAc77620641F72d27a039' ,'0x4c180462A051ab67D8237EdE2c987590DF2FbbE6' ,'0x7b2366996A64effE1aF089fA64e9cf4361FddC6e' ,'0xe3cd19FAbC17bA4b3D11341Aa06b6f245DE3f9A6' ,'0x36998Db3F9d958F0Ebaef7b0B6Bf11F3441b216F' ,'0xA36Aa9dbdB7bbC2c986a5e30386a057f8Aa38d9c' ,'0x7AAEE144a14Ec3ba0E468C9Dcf4a89Fdb62C5AA6' ,'0x8d9261369E3BFba715F63303236C324D2E3C44eC' ,'0x1B7eA7D42c476A1E2808f23e18D850C5A4692DF7' ,'0x1348EA8E35236AA0769b91ae291e7291117bf15C' ,'0xC19cF05F28BD4fd58E427a60EC9416d73B6d6c57' ,'0x4bf44E0c856d096B755D54CA1e9CFdc0115ED2e6' ,'0x9832eE476D66B58d185b7bD46D05CBCbE4e543e1' ,'0xC7C1b169a8d3c5F2D6b25642c4d10DA94fFCd3c9' ,'0x14F78BdCcCD12c4f963bd0457212B3517f974b2b' ,'0x7211EEaD6c7DB1D1Ebd70F5CbCd8833935A04126' ,'0x8d9261369E3BFba715F63303236C324D2E3C44eC' ,'0x7AAEE144a14Ec3ba0E468C9Dcf4a89Fdb62C5AA6' ,'0xE2CDf066eEe46b2C424Dd1894b8aE33f153F533C' ,'0x41DD131e460E18befD262cF4Fe2e2b2F43F6Fb7B' ,'0xD441C97eF1458d847271f91714799007081494eF' ,'0xB345720Ab089A6748CCec3b59caF642583e308Bf' ,'0x3D138E67dFaC9a7AF69d2694470b0B6D37721B06' ,'0xbaeC6eD4A9c3b333E1cB20C3e729D7100c85D8F1' ,'0xE543357D4F0EB174CfC6BeD6Ef5E7Ab5762f1B2B' ,'0xc1F80163cC753f460A190643d8FCbb7755a48409' ,'0x3d7cdE7EA3da7fDd724482f11174CbC0b389BD8b' ,'0x00D1EBE373806B2E5a3db01903AA777FF3F4471d' ,'0x34a649fde43cE36882091A010aAe2805A9FcFf0d' ,'0x56A201b872B50bBdEe0021ed4D1bb36359D291ED' ,'0x34a649fde43cE36882091A010aAe2805A9FcFf0d' ,'0x9A00BEFfa3fc064104b71f6B7EA93bAbDC44D9dA' ,'0x8d9261369E3BFba715F63303236C324D2E3C44eC' ,'0x56A201b872B50bBdEe0021ed4D1bb36359D291ED' ,'0xDdFE74f671F6546F49A6D20909999cFE5F09Ad78' ,'0x4c180462A051ab67D8237EdE2c987590DF2FbbE6' ,'0xDE3E4d173f754704a763D39e1Dcf0a90c37ec7F0' ,'0x0b8e605A7446801ae645e57de5AAbbc251cD1e3c' ,'0x59229eFD5206968301ed67D5b08E1C39e0179897' ,'0xf05b641229bB2aA63b205Ad8B423a390F7Ef05A7' ,'0x4CC19A7A359F2Ff54FF087F03B6887F436F08C11' ,'0xF9D183AF486A973b7921ceb5FdC9908D12AAb440' ,'0xF1A621FE077e4E9ac2c0CEfd9B69551dB9c3f657' ,'0x43a9dA9bAde357843fBE7E5ee3Eedd910F9fAC1e' ,'0xe3cd19FAbC17bA4b3D11341Aa06b6f245DE3f9A6' ,'0x9A00BEFfa3fc064104b71f6B7EA93bAbDC44D9dA' ,'0x9ec255F1AF4D3e4a813AadAB8ff0497398037d56' ,'0x9D840DCcB22E781e7F223adA4dc49E6734D2Ce17' ,'0xe3cd19FAbC17bA4b3D11341Aa06b6f245DE3f9A6' ,'0x56A201b872B50bBdEe0021ed4D1bb36359D291ED' ,'0x394c357DB3177E33Bde63F259F0EB2c04A46827c' ,'0x5b45b0A5C1e3D570282bDdfe01B0465c1b332430' ,'0xe3cd19FAbC17bA4b3D11341Aa06b6f245DE3f9A6' ,'0xb3F3658bF332ba6c9c0Cc5bc1201cABA7ada819B' ,'0x69e02D001146A86d4E2995F9eCf906265aA77d85' ]
    for (let i = 0; i < addresses_array.length; i++) {
      expect(await erc721BeanBasin.ownerOf(i)).to.equal(addresses_array[i]);
    }
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

  it("Should burn an NFT of owner", async function () {
    const { erc721BeanBasin, owner, addr2 , addr1} = await loadFixture(deployAndInit);
    // burn works, even after approval ckeck because whitelisted1 is the owner of the token being burned
    // mint 1 nft to addr2 as the owner
    await erc721BeanBasin.mint(addr2, 1);
    // ensure addr2 is the owner of the new nt
    expect(await erc721BeanBasin.ownerOf(72)).to.equal(addr2.address);
    // connect as addr2 and burn the new token
    await erc721BeanBasin.connect(addr2).burn(72);
    // ensure addr2 no longer owns the token
    expect(await erc721BeanBasin.balanceOf(addr2.address)).to.equal(0);
    // ensure total burned is 1
    expect(await erc721BeanBasin.totalBurned()).to.equal(1);
  });

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

  it("Transfers nft correctly", async function () {
    const { erc721BeanBasin, addr1, addr2 } = await loadFixture(deployAndInit);
    // mint 1 nft to addr2 as the owner
    await erc721BeanBasin.mint(addr2, 1);
    expect(await erc721BeanBasin.ownerOf(72)).to.equal(addr2.address);
    // transfer from addr2 to addr1
    // since the caller is "from" , no need to approve
                                                        // FROM         TO          TOKENID 
    await erc721BeanBasin.connect(addr2).safeTransferFrom(addr2.address, addr1.address, 72);
    expect(await erc721BeanBasin.ownerOf(72)).to.equal(addr1.address);
  });

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
