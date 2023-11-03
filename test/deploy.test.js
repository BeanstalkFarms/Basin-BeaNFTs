const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ERC721ABeanBasin', function () {
    let ERC721ABeanBasin;
    let beanBasin;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        ERC721ABeanBasin = await ethers.getContractFactory('ERC721ABeanBasin');
        [owner, addr1, addr2] = await ethers.getSigners();
        beanBasin = await ERC721ABeanBasin.deploy();
        await beanBasin.deployed();
    });

    describe('Deployment', function () {
        it('Should set the right owner', async function () {
            expect(await beanBasin.owner()).to.equal(owner.address);
        });

        it('Should mint the correct amount of nfts to the right owner', async function () {
            const ownerBalance = await beanBasin.balanceOf(owner.address);
            expect(await beanBasin.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe('Metadata', function () {
        it('Should return the correct token URI', async function () {
            await beanBasin.connect(owner).mint(addr1.address, 'https://example.com/token/1');
            expect(await beanBasin.tokenURI(1)).to.equal('https://example.com/token/1');
        });
    });
});

