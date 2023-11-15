const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const { ethers } = require("ethers")
let fs = require('fs');

// get accounts 
let accounts_array = fs.readFileSync('deployment_array_accounts.txt', 'utf8');
const arrayFromString = accounts_array.slice(1, -1).split(', ');
const cleanedAccountsArray = arrayFromString.map(item => item.trim().replace(/'/g, ''));
cleanedAccountsArray[cleanedAccountsArray.length - 1 ] = cleanedAccountsArray[cleanedAccountsArray.length - 1].replace(']', ''); 

// get balances
let balances_array = fs.readFileSync('deployment_array_counts.txt', 'utf8');
balances_array = balances_array.slice(1, -1).split(', ');
balances_array[balances_array.length - 1 ] = balances_array[balances_array.length - 1].replace(']', '');  

// combine arrays
const combinedArray = cleanedAccountsArray.map((value, index) => [value, balances_array[index]]);

console.log(combinedArray);

// construct merkle tree
const tree = StandardMerkleTree.of(combinedArray, ["address", "uint256"]);

console.log('Merkle Root:', tree.root);

// save merkle root
fs.writeFileSync("root.txt", tree.root);

// save merkle tree
fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));

