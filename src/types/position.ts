import { SupportedChainIds } from "@/providers/config";
import type { Strategy } from "./strategies";

export type Position = {
  id: string;
  createAt: string;
  strategy: Strategy;
  tokenName: string;
  amount: number;
  chainId: SupportedChainIds;
  status: string;
  metadata?: {
    // Uniswap V3 specific fields
    nftTokenId?: string;     // NFT position ID for redemption
    token0?: string;         // First token address (sorted)
    token1?: string;         // Second token address (sorted)
    fee?: number;            // Pool fee tier (100, 500, 3000, 10000)
    tickLower?: number;      // Position lower tick
    tickUpper?: number;      // Position upper tick
    liquidityAmount?: string; // Exact liquidity amount in position
    
    // Future strategy fields can be added here
    // e.g., for leverage strategies:
    // leverageRatio?: number;
    // collateralAmount?: string;
  };
};
