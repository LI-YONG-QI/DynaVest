import { Position } from "@/types/position";
import type { Address } from "viem";
import { encodeFunctionData, formatUnits } from "viem";
import { readContract } from "@wagmi/core";
import { GetProtocolChains } from "@/types/strategies";

import { AAVE_V3_ABI, ERC20_ABI } from "@/constants/abis";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { AAVE } from "@/constants/protocols/aave";
import { wagmiConfig } from "@/providers/config";
import { getTokenByName } from "@/utils/coins";

export class AaveV3Supply extends BaseStrategy<typeof AAVE> {
  constructor(chainId: GetProtocolChains<typeof AAVE>) {
    super(chainId, AAVE, "AaveV3Supply");
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

  async getProfit(user: Address, position: Position) {
    const { amount, tokenName } = position;

    const underlyingAsset = getTokenByName(tokenName).chains![this.chainId];
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

    return Number(formatUnits(aTokenBalance, 6)) - amount;
  }
}
