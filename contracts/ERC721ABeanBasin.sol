// SPDX-License-Identifier: MIT
// Code adopted and modified from:
// Chiru labs: ERC721AUpsgradable v4.2.3

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

/*
* ERC721A Bean Basin
* Contracts for the Basin NFT collection
* Minted to users who deposited >1000 bdv in the 600 seasons 
* post basin deployment
* NFTs are batch minted to addresses on initialization
* No need for a mint function
*/
contract ERC721ABeanBasin is ERC721AUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    // Mapping to mark token upgrades after 1000 seasons held
    mapping(uint256 => bool) public tokenUpgraded;

    /*
    * @param name_ string name of the NFT
    * @param symbol_ string symbol of the NFT
    * @param addresses_ array of addresses to mint to
    * @param amt_ array of amounts to mint to each address
    * Upon initialization, the contract will mint the NFTs to the addresses provided
    */
    function initialize(string memory name_, string memory symbol_,address[] calldata addresses_, uint256[] calldata amounts_) initializerERC721A initializer public {
        __ERC721A_init(name_, symbol_);
        __Ownable_init();
        __adminMintAllInit(addresses_,amounts_);
    }

    /*
    * Perform an upgrade of an ERC1967Proxy, when this contract
    * is set as the implementation behind such a proxy.
    * The _authorizeUpgrade function must be overridden
    * to include access restriction to the upgrade mechanism.
    */
    function _authorizeUpgrade(address) internal override onlyOwner {}

    /*
    * @dev adminMintAllInit function used to mint NFT(s) to addresses
    * @param addresses_ array of addresses to mint to
    * @param amt_ array of amounts to mint to each address
    * This function can only be called on initialization of the contract
    * 
    * _mintERC2309 mints `quantity` tokens and transfers them to `to`.
    *
    * It emits only one {ConsecutiveTransfer} as defined in
    * [ERC2309](https://eips.ethereum.org/EIPS/eip-2309),
    * instead of a sequence of {Transfer} event(s).
    */  
    function __adminMintAllInit(address[] calldata addresses, uint256[] calldata amount) internal onlyInitializingERC721A{
        // check that length of addresses == length of amount 
        require(addresses.length == amount.length);
        
        for(uint256 i; i < addresses.length; ++i){
            _mintERC2309(addresses[i], amount[i]);
        }
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return 'mybaseURI';
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) _revert(URIQueryForNonexistentToken);

        if (tokenUpgraded[tokenId]) {
            // return upgraded tokenURI with easter egg
        } else {
            string memory baseURI = _baseURI();
            return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, _toString(tokenId))) : '';
        }
    }

    /*
    * @dev burn function used to burn NFT(s)
    * @param tokenId uint256 tokenId of NFT to burn
    */
    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    function burn(uint256 tokenId, bool approvalCheck) public {
        _burn(tokenId, approvalCheck);
    }

    /*
    * @dev upgradeNFTs function used to mark NFTs as upgraded
    * Upgraded nfts with easter egg will have a different tokenURI
    * Farmers will get an upgrade if they held their 
    * BEANETH Deposit for 1000+ seasons
    * @param tokenIds array of tokenIds to mark as upgraded
    */
    function upgradeNFTs(uint256[] calldata tokenIds) public onlyOwner {
        for(uint256 i; i < tokenIds.length; ++i){
            tokenUpgraded[tokenIds[i]] = true;
        }
    }
}

