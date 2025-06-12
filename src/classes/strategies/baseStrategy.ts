import type { Address } from "viem";

import {
  Protocol,
  ProtocolChains,
  ProtocolContracts,
} from "@/types/strategies";
import { Position } from "@/types/position";

export type StrategyCall = {
  to: Address;
  data?: `0x${string}`;
  value?: bigint;
};

export abstract class BaseStrategy<T extends Protocol> {
  public readonly chainId: ProtocolChains<T>;

  constructor(
    chainId: number,
    public readonly protocolAddresses: T,
    public readonly name: string
  ) {
    if (this.isSupported(chainId)) {
      this.chainId = chainId as ProtocolChains<T>;
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
    return Object.keys(this.protocolAddresses).map(Number).includes(chainId);
  }

  getAddress(contract: ProtocolContracts<T>) {
    return this.protocolAddresses[this.chainId][contract];
  }
}
