import { Address } from "viem";

import { BaseStrategy, StrategyCall } from "./baseStrategy";
import { Protocols } from "@/types";

/**
 * MultiStrategy allows combining multiple strategies of different types
 * that all implement the StrategyInterface
 */
export class MultiStrategy {
  constructor(
    public readonly strategies: {
      strategy: BaseStrategy<Protocols>;
      allocation: number;
    }[]
  ) {}

  async investCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    const allCalls: StrategyCall[] = [];

    for (const strategy of this.strategies) {
      const calls = await strategy.strategy.investCalls(
        (amount * BigInt(strategy.allocation)) / BigInt(100),
        user,
        asset
      );
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
}
