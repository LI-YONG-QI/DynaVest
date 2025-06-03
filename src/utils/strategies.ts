import { bsc } from "viem/chains";

import { Protocol, Protocols, StrategyMetadata } from "@/types";
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
  CamelotStaking,
  GMXDeposit,
  StCeloStaking,
  AaveV3Supply,
  UniswapV3AddLiquidity,
} from "@/classes/strategies";

export function getDeadline(): bigint {
  const timestampInSeconds = Math.floor(Date.now() / 1000);
  return BigInt(timestampInSeconds) + BigInt(PERMIT_EXPIRY);
}

export function getStrategy(
  protocol: Protocol,
  chainId: number
): BaseStrategy<Protocols> {
  // The type casting here is safe because we've already verified the chainId is supported
  // for the specific protocol with isChainIdSupported
  switch (protocol) {
    case "MorphoSupply":
      return new MorphoSupply(chainId);
    case "AaveV3Supply":
      return new AaveV3Supply(chainId);
    case "StCeloStaking":
      return new StCeloStaking(chainId);
    case "UniswapV3SwapLST": {
      if (chainId === bsc.id) {
        return new UniswapV3SwapLST(chainId, BNB, wbETH);
      } else {
        return new UniswapV3SwapLST(chainId, ETH, wstETH);
      }
    }
    case "UniswapV3AddLiquidity":
      return new UniswapV3AddLiquidity(chainId);
    case "CamelotStaking":
      return new CamelotStaking(chainId);
    case "GMXDeposit":
      return new GMXDeposit(chainId);
    default:
      throw new Error("Unsupported protocol");
  }
}

export function getStrategyMetadata(
  protocol: string,
  chainId: number
): StrategyMetadata {
  const strategyMetadata = STRATEGIES_METADATA.find(
    (s) => s.protocol === protocol && s.chainId === chainId
  );

  if (!strategyMetadata) throw new Error("Strategy metadata not found");
  return strategyMetadata;
}
