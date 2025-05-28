import type { Address } from "viem";

import type {
  Protocols,
  ProtocolChains,
  ProtocolContracts,
} from "@/types/strategies";

export type StrategyCall = {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
};

export type BaseStrategyMetadata = {
  name: string;
  protocol: string;
  type: "Lending" | "Trading" | "Staking" | "Yield" | "Other";
  description: string;
};

export abstract class BaseStrategy<T extends Protocols> {
  public readonly chainId: ProtocolChains<T>;

  constructor(
    chainId: number,
    public readonly protocolAddresses: T,
    public readonly metadata: BaseStrategyMetadata
  ) {
    if (this.isSupported(chainId)) {
      this.chainId = chainId as ProtocolChains<T>;
    } else {
      throw new Error("Chain not supported");
    }
  }

  /**
   * Builds transaction calls for the strategy
   * @param amount - The amount to use in the strategy
   * @param user - The user address that will execute the strategy
   * @param asset - (optional) The asset to invest in. If asset is undefined, the strategy is for native tokens.
   * @returns Array of calls to be executed
   */
  abstract buildCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]>;

  isSupported(chainId: number): boolean {
    return Object.keys(this.protocolAddresses).map(Number).includes(chainId);
  }

  getAddress(contract: ProtocolContracts<T>) {
    return this.protocolAddresses[this.chainId][contract];
  }
}
