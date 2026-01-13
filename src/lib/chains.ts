/**
 * Shardeum Chain Configuration
 * Sphinx 1.X (chainId 8082) - Primary testnet
 * Can be swapped to Mezame (8081) or other networks if needed
 */

import { defineChain } from "viem";

export const shardeumSphinx = defineChain({
  id: 8082,
  name: "Shardeum Sphinx",
  network: "shardeum-sphinx",
  nativeCurrency: {
    decimals: 18,
    name: "Shardeum",
    symbol: "SHM",
  },
  rpcUrls: {
    default: {
      http: ["https://sphinx.shardeum.org/"],
    },
    public: {
      http: ["https://sphinx.shardeum.org/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Shardeum Explorer",
      url: "https://explorer-sphinx.shardeum.org",
    },
  },
  testnet: true,
});

// Contract addresses (will be set after deployment)
export const VERDICT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS || "";

