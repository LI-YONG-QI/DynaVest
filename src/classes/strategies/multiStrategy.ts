import { Address } from "viem";

import { BaseStrategy, StrategyCall } from "./baseStrategy";
import { Protocol } from "@/types";
import {
  UniswapV3AddLiquidity,
  type UniswapV3AddLiquidityParams,
  type UniswapV3InvestParams,
} from "./uniswap/liquidity";

/**
 * MultiStrategy allows combining multiple strategies of different types
 * that all implement the StrategyInterface
 */
export class MultiStrategy {
  constructor(
    public readonly strategies: {
      strategy: BaseStrategy<Protocol>;
      allocation: number;
    }[]
  ) {}

  async investCalls(
    amount: bigint,
    user: Address,
    asset?: Address,
    liquidityOptions?: UniswapV3InvestParams
  ): Promise<StrategyCall[]> {
    const allCalls: StrategyCall[] = [];

    for (const strategy of this.strategies) {
      let calls: StrategyCall[] = [];
      if (strategy.strategy instanceof UniswapV3AddLiquidity) {
        if (!asset || !liquidityOptions)
          throw new Error(
            "UniswapV3AddLiquidity: token0 and liquidityOptions are required"
          );

        calls = await strategy.strategy.investCalls(
          (amount * BigInt(strategy.allocation)) / BigInt(100),
          user,
          asset,
          liquidityOptions
        );
      } else {
        calls = await strategy.strategy.investCalls(
          (amount * BigInt(strategy.allocation)) / BigInt(100),
          user,
          asset
        );
      }

      allCalls.push(...calls);
    }

    return allCalls;
  }

  async redeemCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    const allCalls: StrategyCall[] = [];

    for (const strategy of this.strategies) {
      const calls = await strategy.strategy.redeemCalls(
        (amount * BigInt(strategy.allocation)) / BigInt(100),
        user,
        asset
      );
      allCalls.push(...calls);
    }

    return allCalls;
  }

  isExistAddLiquidity(): boolean {
    return this.strategies.some(
      (strategy) => strategy.strategy instanceof UniswapV3AddLiquidity
    );
  }
}
