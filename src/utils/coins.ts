import { Token } from "@/types";
import { WETH, WBNB, TOKENS, TokensName } from "@/constants/coins";
import { Address } from "viem";

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

export const getTokenByName = (name: string): Token => {
  const token = TOKENS.find((token) => token.name === name);
  if (!token) {
    throw new Error(`Token ${name} not found`);
  }

  return token;
};

export const getTokenAddress = (token: Token, chainId: number): Address => {
  if (!token.chains?.[chainId] && !token.isNativeToken) {
    throw new Error("Token not supported on this chain");
  }

  return token.chains?.[chainId] as Address;
};

export const COINGECKO_IDS: Record<TokensName, string> = {
  USDT: "tether",
  USDC: "usd-coin",
  ETH: "ethereum",
  BNB: "binancecoin",
  CELO: "celo",
  cEUR: "celo-euro",
  WETH: "weth",
  WBNB: "wbnb",
  wstETH: "wrapped-steth",
  wbETH: "wrapped-beacon-eth",
  FLOW: "flow",
  GRAIL: "grail",
  xGRAIL: "grail",
};

export const isCoingeckoId = (id: string): id is TokensName => {
  const NAMES = Object.keys(COINGECKO_IDS);
  return NAMES.includes(id);
};

export function getTokenNameByCoingeckoId(id: string): string {
  return (
    Object.entries(COINGECKO_IDS).find(
      ([, coingeckoId]) => coingeckoId === id
    )?.[0] || ""
  );
}
