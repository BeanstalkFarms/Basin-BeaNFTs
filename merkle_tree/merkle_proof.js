const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const { ethers } = require("ethers")
let fs = require('fs');

// load merkle tree
const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("tree.json", "utf8")));

// get proof for address
for (const [i, v] of tree.entries()) {
  if (v[0] === '0x56a201b872b50bbdee0021ed4d1bb36359d291ed') {
    const proof = tree.getProof(i);
    console.log('Value:', v);
    console.log('Proof:', proof);
  }
}