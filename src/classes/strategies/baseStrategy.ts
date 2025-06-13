import type { Address } from "viem";

import { Protocol } from "@/types/strategies";
import { Position } from "@/types/position";

export type StrategyCall = {
  to: Address;
  data?: `0x${string}`;
  value?: bigint;
};

export abstract class BaseStrategy {
  public readonly chainId: number;

  constructor(
    chainId: number,
    public readonly protocol: Protocol,
    public readonly name: string
  ) {
    if (this.isSupported(chainId)) {
      this.chainId = chainId;
    } else {
      throw new Error("Chain not supported");
    }
  }

  /**
   * Builds invest transaction calls for the strategy
   * @param amount - The amount to use in the strategy
   * @param user - The user address that will execute the strategy
   * @param asset - (optional) The asset to invest in. If asset is undefined, the strategy is for native tokens.
   * @returns Array of calls to be executed
   */
  abstract investCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]>;

  abstract redeemCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]>;

  abstract getProfit(user: Address, position: Position): Promise<number>;

  isSupported(chainId: number): boolean {
    return Object.keys(this.protocol.contracts).map(Number).includes(chainId);
  }

  getAddress(contract: string) {
    const address = this.protocol.contracts[this.chainId][contract];
    if (!address)
      throw new Error(
        `Contract ${contract} not found, Protocol: ${this.protocol.name}, Chain: ${this.chainId}`
      );

    return address;
  }
}
