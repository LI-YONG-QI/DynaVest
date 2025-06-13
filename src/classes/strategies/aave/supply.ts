import { Position } from "@/types/position";
import type { Address } from "viem";
import { encodeFunctionData, formatUnits } from "viem";
import { readContract } from "@wagmi/core";
import { base, celo } from "viem/chains";
import { Protocol } from "@/types/strategies";

import { AAVE_V3_ABI, ERC20_ABI } from "@/constants/abis";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { AAVE, AAVE_CONTRACTS } from "@/constants/protocols/aave";
import { wagmiConfig } from "@/providers/config";
import { getTokenByName } from "@/utils/coins";

export class AaveV3Supply extends BaseStrategy {
  constructor(chainId: AaveV3SupplyChainId) {
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

  getAddress(contract: "pool") {
    return AAVE_CONTRACTS[this.chainId][contract];
  }
}

/**
 * 類型守護函數：檢查 chainId 是否為支持的 Aave V3 Supply 鏈
 * @param chainId - 要檢查的鏈ID
 * @returns boolean - 如果是支持的鏈則返回 true
 */
export function isSupplyChainId(
  protocol: Protocol,
  chainId: number
): chainId is AaveV3SupplyChainId {
  return (
    AAVE_CHAINS.includes(chainId as AaveV3SupplyChainId) && protocol === AAVE
  );
}

const chain = 1;

if (isSupplyChainId(AAVE, chain)) {
  console.log("chain is supported", chain);
  const aave = new AaveV3Supply(chain);
} else {
  console.log("chain is not supported");
}
