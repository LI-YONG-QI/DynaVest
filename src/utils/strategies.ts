import { bsc } from "viem/chains";

import {
  GetProtocolChains,
  Protocol,
  type Strategy,
  StrategyMetadata,
} from "@/types";
import {
  BNB,
  ETH,
  FLUID,
  MORPHO,
  PERMIT_EXPIRY,
  STRATEGIES_METADATA,
  UNISWAP,
  wbETH,
  wstETH,
} from "@/constants";
import {
  BaseStrategy,
  MorphoSupply,
  UniswapV3SwapLST,
  AaveV3Supply,
  FluidSupply,
} from "@/classes/strategies";
import { AAVE } from "@/constants/protocols/aave";

export function isChainSupported<T extends Protocol>(
  protocol: T,
  chainId: number
): chainId is GetProtocolChains<T> {
  return Object.keys(protocol.contracts).map(Number).includes(chainId);
}

export function getDeadline(): bigint {
  const timestampInSeconds = Math.floor(Date.now() / 1000);
  return BigInt(timestampInSeconds) + BigInt(PERMIT_EXPIRY);
}

/**
 * @dev Only used in `getStrategy`
 * @dev Allow `as`, because check chainId if supported before create strategy instance
 */
const STRATEGY_CONFIGS: Record<
  Strategy,
  {
    protocol: Protocol;
    factory: (chainId: GetProtocolChains<Protocol>) => BaseStrategy<Protocol>;
  }
> = {
  MorphoSupply: {
    protocol: MORPHO,
    factory: (chainId) =>
      new MorphoSupply(chainId as GetProtocolChains<typeof MORPHO>),
  },
  AaveV3Supply: {
    protocol: AAVE,
    factory: (chainId) =>
      new AaveV3Supply(chainId as GetProtocolChains<typeof AAVE>),
  },
  UniswapV3SwapLST: {
    protocol: UNISWAP,
    factory: (chainId) => {
      const typedChainId = chainId as GetProtocolChains<typeof UNISWAP>;
      // 根據不同鏈條選擇不同的 token 組合
      if (chainId === bsc.id) {
        return new UniswapV3SwapLST(typedChainId, BNB, wbETH);
      } else {
        return new UniswapV3SwapLST(typedChainId, ETH, wstETH);
      }
    },
  },
  FluidSupply: {
    protocol: FLUID,
    factory: (chainId) =>
      new FluidSupply(chainId as GetProtocolChains<typeof FLUID>),
  },

  // Legacy
  StCeloStaking: {
    protocol: MORPHO, // 暫時用 MORPHO，實際應該是 CELO 協議
    factory: () => {
      throw new Error("StCeloStaking not implemented yet");
    },
  },
  UniswapV3AddLiquidity: {
    protocol: UNISWAP,
    factory: () => {
      throw new Error("UniswapV3AddLiquidity not implemented yet");
    },
  },
  CamelotStaking: {
    protocol: MORPHO, // 暫時用 MORPHO，實際應該是 CAMELOT 協議
    factory: () => {
      throw new Error("CamelotStaking not implemented yet");
    },
  },
  GMXDeposit: {
    protocol: MORPHO, // 暫時用 MORPHO，實際應該是 GMX 協議
    factory: () => {
      throw new Error("GMXDeposit not implemented yet");
    },
  },
  MultiStrategy: {
    protocol: MORPHO, // MultiStrategy 比較特殊，可能需要特殊處理
    factory: () => {
      throw new Error("MultiStrategy not implemented yet");
    },
  },
};

export function getStrategy(
  strategy: Strategy,
  chainId: number
): BaseStrategy<Protocol> {
  const config = STRATEGY_CONFIGS[strategy];

  try {
    if (isChainSupported(config.protocol, chainId)) {
      return config.factory(chainId);
    }
    throw new Error(`Strategy ${strategy} not found on chain ${chainId}`);
  } catch (error) {
    console.error(error);
    throw new Error(`Strategy ${strategy} not found on chain ${chainId}`);
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
