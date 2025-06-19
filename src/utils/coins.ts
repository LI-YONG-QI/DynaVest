import { Token } from "@/types";
import { WETH, WBNB, TOKENS } from "@/constants/coins";
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

export const COINGECKO_IDS: Record<string, string> = {
  USDT: "tether",
  USDC: "usd-coin",
  ETH: "ethereum",
  BNB: "binancecoin",
};

export function getTokenNameByCoingeckoId(id: string): string {
  return (
    Object.entries(COINGECKO_IDS).find(
      ([name]) => COINGECKO_IDS[name] === id
    )?.[0] || ""
  );
}
