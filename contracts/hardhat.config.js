require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    shardeumSphinx: {
      url: "https://sphinx.shardeum.org/",
      chainId: 8082,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

