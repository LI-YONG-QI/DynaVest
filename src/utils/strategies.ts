import { bsc } from "viem/chains";

import { type Strategy, StrategyMetadata } from "@/types";
import {
  BNB,
  ETH,
  PERMIT_EXPIRY,
  STRATEGIES_METADATA,
  wbETH,
  wstETH,
} from "@/constants";
import {
  BaseStrategy,
  MorphoSupply,
  UniswapV3SwapLST,
  AaveV3Supply,
} from "@/classes/strategies";
import { AAVE, isChainSupported } from "@/constants/protocols/aave";

export function getDeadline(): bigint {
  const timestampInSeconds = Math.floor(Date.now() / 1000);
  return BigInt(timestampInSeconds) + BigInt(PERMIT_EXPIRY);
}

export function getStrategy(strategy: Strategy, chainId: number): BaseStrategy {
  // The type casting here is safe because we've already verified the chainId is supported
  // for the specific protocol with isChainIdSupported
  switch (strategy) {
    case "MorphoSupply":
      return new MorphoSupply(chainId);
    case "AaveV3Supply":
      if (isChainSupported(AAVE, chainId)) {
        return new AaveV3Supply(chainId);
      }
      throw new Error("Unsupported chain");
    case "UniswapV3SwapLST": {
      if (chainId === bsc.id) {
        return new UniswapV3SwapLST(chainId, BNB, wbETH);
      } else {
        return new UniswapV3SwapLST(chainId, ETH, wstETH);
      }
    }
    default:
      throw new Error("Unsupported protocol");
  }
}

export function getStrategyMetadata(
  strategy: Strategy,
  chainId: number
): StrategyMetadata {
  const strategyMetadata = STRATEGIES_METADATA.find(
    (s) => s.id === strategy && s.chainId === chainId
  );

  if (!strategyMetadata) throw new Error("Strategy metadata not found");
  return strategyMetadata;
}
