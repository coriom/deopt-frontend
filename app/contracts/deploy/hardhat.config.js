require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
const path = require("path");

const contractsPath = path.join(__dirname, ".."); // compile le .sol du dossier parent

module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  paths: {
    sources: contractsPath,
    cache: path.join(__dirname, "cache"),
    artifacts: path.join(__dirname, "artifacts"),
  },
  networks: {
    amoy:    { url: process.env.RPC_POLYGON_AMOY,    chainId: 80002, accounts: [process.env.DEPLOYER_PRIVATE_KEY] },
    polygon: { url: process.env.RPC_POLYGON_MAINNET, chainId: 137,   accounts: [process.env.DEPLOYER_PRIVATE_KEY] },
  },
};
