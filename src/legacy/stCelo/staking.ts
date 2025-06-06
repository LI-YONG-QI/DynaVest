import { Address, encodeFunctionData } from "viem";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { STAKED_CELO_ABI } from "@/constants/abis";
import { ST_CELO_CONTRACTS } from "@/constants/protocols";

export class StCeloStaking extends BaseStrategy<typeof ST_CELO_CONTRACTS> {
  constructor(chainId: number) {
    super(chainId, ST_CELO_CONTRACTS, {
      name: "StakedCelo Staking",
      type: "Staking",
      protocol: "StakedCelo",
      description: "Stake CELO tokens",
    });
  }

  async buildCalls(amount: bigint, user: Address): Promise<StrategyCall[]> {
    const manager = this.getAddress("manager");

    console.log(user);

    return [
      {
        to: manager,
        value: amount,
        data: encodeFunctionData({
          abi: STAKED_CELO_ABI,
          functionName: "deposit",
          args: [],
        }),
      },
    ];
  }
}
