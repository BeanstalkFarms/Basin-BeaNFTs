// SPDX-License-Identifier: MIT
// Code adopted and modified from:
// Chiru labs: ERC721AUpsgradable v4.2.3

pragma solidity ^0.8.20;

import './ERC721ABeanBasin.sol';

contract MockERC721ABeanBasinV2 is ERC721ABeanBasin {

    string public baseUri;

    string public upgradedBaseUri;

    function upgradeTest() public pure returns (string memory){
        return "upgraded_contract";
    }

}

