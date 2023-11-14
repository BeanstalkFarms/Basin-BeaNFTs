// SPDX-License-Identifier: MIT
// Code adopted and modified from:
// Chiru labs: ERC721AUpgradable v4.2.3

pragma solidity ^0.8.20;

import './ERC721ABeanBasin.sol';

contract MockBatchMint is ERC721ABeanBasin{

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
    * Added public variation for testing purposes
    */  
    function ___batchMintAllInit(address[] calldata addresses, uint256[] calldata amount) public {
        // check that length of addresses == length of amount 
        require(addresses.length == amount.length, "MockBatchMint: length of addresses != length of amounts to mint");
        
        for(uint256 i; i < addresses.length; ++i){
            _mintERC2309(addresses[i], amount[i]);
        }
    }

}