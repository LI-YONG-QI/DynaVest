import type { Address } from "viem";
import { encodeFunctionData, formatUnits } from "viem";
import { readContract } from "@wagmi/core";

import { AAVE_V3_ABI, ERC20_ABI } from "@/constants/abis";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { AAVE_CONTRACTS } from "@/constants/protocols/aave";
import { wagmiConfig } from "@/providers/config";

export class AaveV3Supply extends BaseStrategy<typeof AAVE_CONTRACTS> {
  constructor(chainId: number) {
    super(chainId, AAVE_CONTRACTS, {
      name: "AaveV3Supply",
      type: "Lending",
      protocol: "Aave",
      description: "Lend assets to Aave V3",
    });
  }

  async investCalls(
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

  async redeemCalls(
    amount: bigint,
    user: Address,
    underlyingAsset?: Address
  ): Promise<StrategyCall[]> {
    if (!underlyingAsset) throw new Error("AaveV3Supply: asset is required");
    const pool = this.getAddress("pool");

    const aTokenAddress = await readContract(wagmiConfig, {
      abi: AAVE_V3_ABI,
      address: pool,
      functionName: "getReserveAToken",
      args: [underlyingAsset],
    });

    const aTokenBalance = await readContract(wagmiConfig, {
      abi: ERC20_ABI,
      address: aTokenAddress as Address,
      functionName: "balanceOf",
      args: [user],
    });

    return [
      {
        to: pool,
        data: encodeFunctionData({
          abi: AAVE_V3_ABI,
          functionName: "withdraw",
          args: [underlyingAsset, aTokenBalance, user],
        }),
      },
    ];
  }

  async getProfit(data: {
    user: Address;
    amount: bigint;
    underlyingAsset: Address;
  }) {
    const { user, amount, underlyingAsset } = data;
    const pool = this.getAddress("pool");

    const aTokenAddress = await readContract(wagmiConfig, {
      abi: AAVE_V3_ABI,
      address: pool,
      functionName: "getReserveAToken",
      args: [underlyingAsset],
    });

    const aTokenBalance = await readContract(wagmiConfig, {
      abi: ERC20_ABI,
      address: aTokenAddress as Address,
      functionName: "balanceOf",
      args: [user],
    });

    const profit = aTokenBalance - amount;
    return formatUnits(profit, 6);
  }
}
