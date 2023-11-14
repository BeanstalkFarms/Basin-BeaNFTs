// SPDX-License-Identifier: MIT
// Code adopted and modified from:
// Chiru labs: ERC721AUpgradable v4.2.3

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

contract ERC721ABeanBasin is ERC721AUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    // Mapping to mark token upgrades after 1800 seasons of deposit holding
    // after basin deployment.
    mapping(uint256 id => bool upgraded) public isUpgraded;

    /*
    * @param name_ string name of the NFT.
    * @param symbol_ string symbol of the NFT.
    * @param addresses_ array of addresses to mint to.
    * @param amt_ array of amounts to mint to each address.
    * Upon initialization, the contract will mint the NFTs to the addresses provided.
    */
    function initialize(string memory name_, string memory symbol_,address[] calldata addresses_, uint256[] calldata amounts_) initializerERC721A initializer public {
        __ERC721A_init(name_, symbol_);
        __Ownable_init(msg.sender);
        __batchMintAllInit(addresses_,amounts_);
    }

    /*
    * Perform an upgrade of an ERC1967Proxy, when this contract.
    * is set as the implementation behind such a proxy.
    * The _authorizeUpgrade function must be overridden.
    * to include access restriction to the upgrade mechanism.
    */
    function _authorizeUpgrade(address) internal override onlyOwner {}

    /*
    * @dev __batchMintAllInit function used to mint NFT(s) to addresses.
    * @param addresses_ array of addresses to mint to.
    * @param amt_ array of amounts to mint to each address.
    * This function can only be called on initialization of the contract.
    * 
    * _mintERC2309 mints `quantity` tokens and transfers them to `to`.
    *
    * It emits only one {ConsecutiveTransfer} as defined in.
    * [ERC2309](https://eips.ethereum.org/EIPS/eip-2309),
    * instead of a sequence of {Transfer} event(s).
    */  
    function __batchMintAllInit(address[] calldata addresses, uint256[] calldata amount) internal onlyInitializingERC721A{
        // check that length of addresses == length of amount.
        require(addresses.length == amount.length, "ERC721ABeanBasin: length of addresses != length of amounts to mint");
        
        for(uint256 i; i < addresses.length; ++i){
            _mintERC2309(addresses[i], amount[i]);
        }
    }

    /*
    * @dev baseURI function used to return the IPFS baseURI for the metadata.
    * @return string baseURI of the NFT.
    */
    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return 'ipfs://QmT5roBqPD9cQX8pPFVmLygGPBdw3gY2azqYDeCT6YHsnw/';
    }

    /*
    * @dev baseURI function used to return the IPFS baseURI for the metadata.
    * @return string baseURI of the NFT.
    */
    function upgradedBaseURI() public view returns (string memory) {
        return _upgradedBaseURI();
    }


    function _upgradedBaseURI() internal view virtual returns (string memory) {
        return 'ipfs://QmXQd2bpwZTtDst3eaGcCHEv13yzanbKsBuvuZhzXKs15a/';
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory uri = isUpgraded[tokenId] ? _upgradedBaseURI() : _baseURI();
        return bytes(uri).length != 0 ? string(abi.encodePacked(uri, _toString(tokenId),".json")) : '';
    }

    /*
    * @dev exists function used to check if a tokenId exists.
    * @param tokenId uint256 tokenId of NFT to check.
    * @return bool true if exists, false if not.
    */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    /*
    * @dev burn function used to burn NFT(s).
    * @param tokenId uint256 tokenId of NFT to burn.
    * Enforces an approval check
    */
    function burn(uint256 tokenId) public {
        _burn(tokenId , true);
    }

    /*
    * @dev upgradeNFTs function used to mark NFTs as upgraded.
    * Upgraded nfts with easter egg will have a different tokenURI.
    * Farmers will get an upgrade if they held their.
    * BEANETH Deposit for 1000+ seasons.
    * @param tokenIds array of tokenIds to mark as upgraded.
    */
    function upgradeNFTs(uint256[] calldata tokenIds) public onlyOwner {
        for(uint256 i; i < tokenIds.length; ++i){
            isUpgraded[tokenIds[i]] = true;
        }
    }

    /*
    * @dev isNFTUpgraded function used to check if an NFT is upgraded.
    * Upgraded nfts with easter egg will have a different tokenURI.
    */
    function isNFTUpgraded(uint256 tokenId) public view returns (bool) {
        return isUpgraded[tokenId];
    }

    /**
     * Returns the number of tokens minted by `owner`.
     */
    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    /**
     * @dev Returns the total amount of tokens minted in the contract.
     */
    function totalMinted() public view returns (uint256) {
        return _totalMinted();
    }


    /**
     * @dev Returns the total number of tokens burned.
     */
    function totalBurned() public view returns (uint256) {
        return _totalBurned();
    }

    /**
     * @dev Returns the next token ID to be minted.
    */
    function nextTokenId() public view returns (uint256) {
        return _nextTokenId();
    }

    /**
     * Returns the auxiliary data for `owner`. (e.g. number of whitelist mint slots used).
    */
    function getAux(address owner) public view returns (uint64) {
        return _getAux(owner);
    }

    /**
     * Sets the auxiliary data for `owner`. (e.g. number of whitelist mint slots used).
     * If there are multiple variables, please pack them into a uint64.
     */
    function setAux(address owner, uint64 aux) public {
        _setAux(owner, aux);
    }
}

