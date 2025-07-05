import { base, bsc, celo, arbitrum, polygon } from "viem/chains";
import type { Token } from "@/types";

export const USDT = {
  name: "USDT",
  icon: "/crypto-icons/usdt.svg",
  decimals: 6,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    [base.id]: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    [bsc.id]: "0x55d398326f99059fF775485246999027B3197955",
  },
} as const satisfies Token;

export const USDC = {
  name: "USDC",
  icon: "/crypto-icons/usdc.svg",
  decimals: 6,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    [bsc.id]: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  },
} as const satisfies Token;

export const ETH = {
  name: "ETH",
  icon: "/crypto-icons/eth.svg",
  decimals: 18,
  isNativeToken: true,
} as const satisfies Token;

export const BNB = {
  name: "BNB",
  icon: "/crypto-icons/chains/56.svg",
  decimals: 18,
  isNativeToken: true,
} as const satisfies Token;

export const wstETH = {
  name: "wstETH",
  icon: "/crypto-icons/wstETH.webp",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [base.id]: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    [arbitrum.id]: "0x5979D7b546E38E414F7E9822514be443A4800529",
  },
} as const satisfies Token;

export const wbETH = {
  name: "wbETH",
  icon: "/crypto-icons/wbeth.webp",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [bsc.id]: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
  },
} as const satisfies Token;

export const cbBTC = {
  name: "cbBTC",
  icon: "/crypto-icons/cbBTC.svg",
  decimals: 8,
  isNativeToken: false,
  chains: {
    [base.id]: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  },
} as const satisfies Token;

export const CELO = {
  name: "CELO",
  icon: "/crypto-icons/chains/42220.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [celo.id]: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  },
} as const satisfies Token;

export const FLOW = {
  name: "FLOW",
  icon: "/crypto-icons/chains/747.svg",
  decimals: 18,
  isNativeToken: true,
} as const satisfies Token;

export const cEUR = {
  name: "cEUR",
  icon: "/crypto-icons/cEUR.png",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [celo.id]: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  },
} as const satisfies Token;

export const WETH = {
  name: "WETH",
  icon: "/crypto-icons/weth.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [base.id]: "0x4200000000000000000000000000000000000006",
    [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
} as const satisfies Token;

export const GRAIL = {
  name: "GRAIL",
  icon: "/crypto-icons/grail.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8",
  },
} as const satisfies Token;

export const xGRAIL = {
  name: "xGRAIL",
  icon: "/crypto-icons/xgrail.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0x3CAaE25Ee616f2C8E13C74dA0813402eae3F496b",
  },
} as const satisfies Token;

export const WBNB = {
  name: "WBNB",
  icon: "/crypto-icons/bnb.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [bsc.id]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
} as const satisfies Token;

export const TOKENS = [
  USDT,
  USDC,
  ETH,
  BNB,
  WETH,
  WBNB,
  wstETH,
  cbBTC,
  wbETH,
  CELO,
  FLOW,
  cEUR,
  GRAIL,
  xGRAIL,
] as const;

export type TokensName = (typeof TOKENS)[number]["name"];
