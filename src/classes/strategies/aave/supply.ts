import type { Address } from "viem";
import { encodeFunctionData } from "viem";

import { AAVE_V3_ABI, ERC20_ABI } from "@/constants/abis";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { AAVE_CONTRACTS } from "@/constants/protocols/aave";

export class AaveV3Supply extends BaseStrategy<typeof AAVE_CONTRACTS> {
  constructor(chainId: number) {
    super(chainId, AAVE_CONTRACTS, {
      name: "Aave V3 Supply",
      type: "Lending",
      protocol: "Aave",
      description: "Lend assets to Aave V3",
    });
  }

  async buildCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset) {
      throw new Error("AaveV3Supply: asset is required");
    }

    const pool = this.getAddress("pool");

    return [
      {
        to: asset,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [pool, amount],
        }),
      },
      {
        to: pool,
        data: encodeFunctionData({
          abi: AAVE_V3_ABI,
          functionName: "supply",
          args: [asset, amount, user, 0],
        }),
      },
    ];
  }
}
