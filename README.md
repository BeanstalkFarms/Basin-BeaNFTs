<h1 align="center"> Basin BeaNFTs </h1>

## Description
In August 23 2023 Beanstalk Farms introduced [Basin](https://basin.exchange/). Basin is the next step in the evolution of EVM-native DEXs, allowing for arbitrary composability amongst DEX components into a single liquidity pool known as a Well. Along with Basin, the BEANETH Well was whitelisted in the Silo allowing farmers to provide liquidity and accelerate the growth of the $BEAN ecosystem. To commemorate this event, Beanstalk launched the Basin BeaNFT collection. NFTs were minted to Farmers who deposited a minimum of 1.000 BDV into the BEAN:ETH Well in the 600 Seasons following the commitment of the Basin Integration BIP and held the Deposit in the Silo for a minimum of 600 subsequent Seasons.

## Getting Started

- Clone this repository and run `npm install` to install Hardhat and all dependencies.

```
git clone https://github.com/BeanstalkFarms/Basin-BeaNFTs.git
cd Basin-BeaNFTs
npm install
```

- Create a `.env` file in the root directory of this project and add your Alchemy API key and wallet private key as shown in `.env.example`.

- Compile the smart contracts.

```
npx hardhat compile
```

- Run the tests.

```
npx hardhat test
```

## Notes and optimizations
- The contracts follow the UUPS proxy pattern. 

- The code was adopted and modified from the [ERC721AUpgradable](https://github.com/chiru-labs/ERC721A-Upgradeable) implementation from Chiru Labs. This allowed for significant gas savings during the minting process. Comprehensive gas reports can be found in the `gas_reports` directory.

- All nfts were minted to addresses upon initialization of the contract. 