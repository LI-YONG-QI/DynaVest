import { Address, encodeFunctionData } from "viem";
import { readContract } from "@wagmi/core";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { GMX_CONTRACTS } from "@/constants/protocols/gmx";
import { wagmiConfig } from "@/providers/config";
import { GMX_STRATEGY_ABI, ERC20_ABI } from "@/constants/abis";

export class GMXDeposit extends BaseStrategy<typeof GMX_CONTRACTS> {
  constructor(chainId: number) {
    super(chainId, GMX_CONTRACTS, {
      name: "GMX Deposit",
      type: "Yield",
      protocol: "GMX",
      description: "Deposit assets to GMX vault",
    });
  }

  async buildCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset) {
      // For native ETH deposits to Beefy vault via GMX strategy
      const gmxStrategy = this.getAddress("gmxStrategy");

      return [
        {
          to: gmxStrategy,
          value: amount,
          data: encodeFunctionData({
            abi: GMX_STRATEGY_ABI,
            functionName: "depositToBeefyVaultWithETH",
            args: [],
          }),
        },
      ];
    } else {
      throw new Error(
        "GMXDeposit: Only native ETH is supported for GMX strategy"
      );
    }
  }

  async getBeefyVaultBalance(user: Address): Promise<bigint> {
    const beefyVault = this.getAddress("beefyVault");

    const beefyBalance = (await readContract(wagmiConfig, {
      address: beefyVault,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [user],
    })) as bigint;

    return beefyBalance;
  }
}
