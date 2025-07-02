/* eslint-disable */

import { Address, encodeFunctionData, Hex } from "viem";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { UNISWAP } from "@/constants/protocols/uniswap";
import { ERC20_ABI, NFT_MANAGER_ABI } from "@/constants/abis";
import { getDeadline } from "@/utils/strategies";
import { GetProtocolChains } from "@/types/strategies";
import { Position } from "@/types/position";

export type UniswapV3AddLiquidityParams = {
  swapCalldata: Hex;
  swapAsset: Address;
  fee: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  slippage: number;
};

/**
 * Compares two addresses lexicographically
 * @param addressA First address
 * @param addressB Second address
 * @returns negative if addressA < addressB, positive if addressA > addressB, 0 if equal
 */
export function compareAddresses(addressA: Address, addressB: Address): number {
  // Convert to lowercase to ensure consistent comparison
  const a = addressA.toLowerCase();
  const b = addressB.toLowerCase();

  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Returns addresses sorted in ascending order
 * @param addressA First address
 * @param addressB Second address
 * @returns [smallerAddress, largerAddress]
 */
export function sortAddresses(
  addressA: Address,
  addressB: Address
): [Address, Address] {
  return compareAddresses(addressA, addressB) < 0
    ? [addressA, addressB]
    : [addressB, addressA];
}

export class UniswapV3AddLiquidity extends BaseStrategy<typeof UNISWAP> {
  constructor(chainId: GetProtocolChains<typeof UNISWAP>) {
    super(chainId, UNISWAP, "UniswapV3AddLiquidity");
  }

  async investCalls(
    amount: bigint,
    user: Address,
    inputAsset: Address,
    liquidityParams?: UniswapV3AddLiquidityParams
  ): Promise<StrategyCall[]> {
    if (!inputAsset || !liquidityParams) {
      throw new Error(
        "UniswapV3AddLiquidity: inputAsset and liquidityParams are required"
      );
    }

    const {
      swapCalldata,
      swapAsset,
      amount0Desired,
      amount1Desired,
      slippage,
    } = liquidityParams;

    const nftManager = this.getAddress("nftManager");
    const swapRouter = this.getAddress("swapRouter");
    const deadline = getDeadline();

    const [token0, token1] = sortAddresses(inputAsset, swapAsset);

    return [
      {
        to: inputAsset,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [swapRouter, amount],
        }),
      },
      {
        to: swapRouter,
        data: swapCalldata,
      },
      {
        to: token0,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [nftManager, amount0Desired],
        }),
      },
      {
        to: token1,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [nftManager, amount1Desired],
        }),
      },
      {
        to: nftManager,
        data: encodeFunctionData({
          abi: NFT_MANAGER_ABI,
          functionName: "mint",
          args: [
            {
              token0,
              token1,
              fee: 100, // TODO: doesn't hardcode
              tickLower: -887220, // Full range by default
              tickUpper: 887220,
              amount0Desired,
              amount1Desired,
              amount0Min: (amount * BigInt(100 - slippage)) / BigInt(100),
              amount1Min:
                (amount1Desired * BigInt(100 - slippage)) / BigInt(100),
              recipient: user,
              deadline,
            },
          ],
        }),
      },
    ];
  }

  async redeemCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    // TODO: Implement liquidity removal logic
    throw new Error("UniswapV3AddLiquidity redeemCalls not implemented yet");
  }

  async getProfit(user: Address, position: Position): Promise<number> {
    // TODO: Implement profit calculation logic
    throw new Error("UniswapV3AddLiquidity getProfit not implemented yet");
  }
}
