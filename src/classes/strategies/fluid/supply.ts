import { Address, encodeFunctionData } from "viem";

import { ERC20_ABI } from "@/constants/abis/erc20";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { FLUID } from "@/constants/protocols/fluid";
import { GetProtocolChains } from "@/types/strategies";
import { FLUID_ABI } from "@/constants/abis/fluid";
import { Position } from "@/types/position";

export class FluidSupply extends BaseStrategy<typeof FLUID> {
  constructor(chainId: GetProtocolChains<typeof FLUID>) {
    super(chainId, FLUID, "FluidSupply");
  }

  async investCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    //! Only support USDC
    if (!asset) {
      throw new Error("FluidSupply: asset is required");
    }

    const fUSDC = this.getAddress("fUSDC");

    return [
      {
        to: asset,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [fUSDC, amount],
        }),
      },
      {
        to: fUSDC,
        data: encodeFunctionData({
          abi: FLUID_ABI,
          functionName: "deposit",
          args: [amount, user],
        }),
      },
    ];
  }

  async redeemCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    //! Only support USDC
    if (!asset) {
      throw new Error("FluidSupply: asset is require");
    }

    const fUSDC = this.getAddress("fUSDC");

    return [
      {
        to: fUSDC,
        data: encodeFunctionData({
          abi: FLUID_ABI,
          functionName: "withdraw",
          args: [amount, user, user],
        }),
      },
    ];
  }

  async getProfit(user: Address, position: Position) {
    const { createAt } = position;

    const now = new Date();
    const createdAt = new Date(createAt);
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate profit using APY 4.5%
    const APY = 0.0623; // 6.23%
    const dailyRate = APY / 365;
    const profit = position.amount * dailyRate * diffDays;

    return profit;
  }
}
