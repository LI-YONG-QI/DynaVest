import { base, bsc, celo, arbitrum, polygon, baseSepolia } from "viem/chains";
import type { Token } from "@/types";

export const USDT: Token = {
  name: "USDT",
  icon: "/crypto-icons/usdt.svg",
  decimals: 6,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    [base.id]: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    [bsc.id]: "0x55d398326f99059fF775485246999027B3197955",
  },
};

export const USDC: Token = {
  name: "USDC",
  icon: "/crypto-icons/usdc.svg",
  decimals: 6,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    [bsc.id]: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
};

export const ETH: Token = {
  name: "ETH",
  icon: "/crypto-icons/eth.svg",
  decimals: 18,
  isNativeToken: true,
};

export const BNB: Token = {
  name: "BNB",
  icon: "/crypto-icons/bnb.svg",
  decimals: 18,
  isNativeToken: true,
};

export const wstETH: Token = {
  name: "wstETH",
  icon: "/crypto-icons/weth.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [base.id]: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    [arbitrum.id]: "0x5979D7b546E38E414F7E9822514be443A4800529",
  },
};

export const wbETH: Token = {
  name: "wbETH",
  icon: "/crypto-icons/weth.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [bsc.id]: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
  },
};

export const cbBTC: Token = {
  name: "cbBTC",
  icon: "/crypto-icons/cbBTC.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [base.id]: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  },
};

export const CELO: Token = {
  name: "CELO",
  icon: "/crypto-icons/celo.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [celo.id]: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  },
};

export const FLOW: Token = {
  name: "FLOW",
  icon: "/crypto-icons/flow.svg",
  decimals: 18,
  isNativeToken: true,
};

export const cEUR: Token = {
  name: "cEUR",
  icon: "/crypto-icons/cEUR.png",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [celo.id]: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  },
};

export const WETH: Token = {
  name: "WETH",
  icon: "/crypto-icons/weth.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [base.id]: "0x4200000000000000000000000000000000000006",
    [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
};

export const GRAIL: Token = {
  name: "GRAIL",
  icon: "/crypto-icons/grail.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8",
  },
};

export const xGRAIL: Token = {
  name: "xGRAIL",
  icon: "/crypto-icons/xgrail.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [arbitrum.id]: "0x3CAaE25Ee616f2C8E13C74dA0813402eae3F496b",
  },
};

export const WBNB: Token = {
  name: "WBNB",
  icon: "/crypto-icons/bnb.svg",
  decimals: 18,
  isNativeToken: false,
  chains: {
    [bsc.id]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
};

export function getWrappedToken(token: Token): Token {
  if (token.isNativeToken) {
    switch (token.name) {
      case "ETH":
        return WETH;
      case "BNB":
        return WBNB;
      default:
        throw new Error("Token does't have wrapped token");
    }
  } else {
    throw new Error("Token does't have wrapped token");
  }
}
