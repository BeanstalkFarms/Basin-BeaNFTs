// SPDX-License-Identifier: MIT
// Code adopted and modified from:
// Chiru labs: ERC721AUpsgradable v4.2.3

pragma solidity ^0.8.20;

import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";


/*
* ERC721A Bean Basin
* Contracts for the Basin NFT collection
* Minted to users who deposited >1000 bdv in the 600 seasons 
* post basin deployment
* NFTs are batch minted to addresses on initialization
* No need for a mint function
*/
contract MockBatchMint is ERC721AUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    // Mapping to mark token upgrades after 1000 seasons of deposit holding
    mapping(uint256 => bool) public tokenUpgraded;

    /*
    * @param name_ string name of the NFT
    * @param symbol_ string symbol of the NFT
    * @param addresses_ array of addresses to mint to
    * @param amt_ array of amounts to mint to each address
    * Upon initialization, the contract will mint the NFTs to the addresses provided
    */
    function initialize(string memory name_, string memory symbol_) initializerERC721A initializer public {
        __ERC721A_init(name_, symbol_);
        __Ownable_init(msg.sender);
    }

    /*
    * Perform an upgrade of an ERC1967Proxy, when this contract
    * is set as the implementation behind such a proxy.
    * The _authorizeUpgrade function must be overridden
    * to include access restriction to the upgrade mechanism.
    */
    function _authorizeUpgrade(address) internal override onlyOwner {}

    /*
    * @dev __batchMintAllInit function used to mint NFT(s) to addresses
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
    function __batchMintAllInit(address[] calldata addresses, uint256[] calldata amount) public {
        // check that length of addresses == length of amount 
        require(addresses.length == amount.length, "MockBatchMint: length of addresses != length of amounts to mint");
        
        for(uint256 i; i < addresses.length; ++i){
            _mintERC2309(addresses[i], amount[i]);
        }
    }

    /**
     * @dev Returns the next token ID to be minted.
    */
    function nextTokenId() public view returns (uint256) {
        return _nextTokenId();
    }
}