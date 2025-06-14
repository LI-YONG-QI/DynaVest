import type { Address } from "viem";

import {
  GetProtocolChains,
  GetProtocolContractNames,
  Protocol,
} from "@/types/strategies";
import { Position } from "@/types/position";

export type StrategyCall = {
  to: Address;
  data?: `0x${string}`;
  value?: bigint;
};

export abstract class BaseStrategy<T extends Protocol> {
  constructor(
    public readonly chainId: GetProtocolChains<T>,
    public readonly protocol: T,
    public readonly name: string
  ) {}

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

  getAddress(contract: GetProtocolContractNames<T>) {
    const address = this.protocol.contracts[this.chainId][contract];

    return address;
  }
}
