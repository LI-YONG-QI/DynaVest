import type { TypedData, Address } from "viem";

export const PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const satisfies TypedData;

export type Protocol =
  | "1inch"
  | "AAVE"
  | "stCelo"
  | "ankrFlow"
  | "Kitty"
  | "Flow"
  | "Morpho"
  | "Uniswap"
  | "BSC Aave"
  | "LST"
  | "BSC LST"
  | "Camelot"
  | "GMX"
  | "MiniPay stCelo";

export type StrategyMetadata = InvestStrategy & {
  displayInsufficientBalance?: boolean;
};

export type InvestStrategy = {
  title: string;
  apy: number;
  risk: {
    level: "Low" | "Medium" | "High";
    color: string;
    bgColor: string;
  };
  protocol: Protocol;
  description: string;
  image: string;
  externalLink?: string;
  learnMoreLink?: string;
  chainId: number;
  tokens: Token[];
};

export type Token = {
  name: string;
  icon: string;
  decimals: number;
  isNativeToken: boolean;
  chains?: {
    [key: number]: Address;
  };
};

export type Chain = {
  name: string;
  id: number;
  icon: string;
};
