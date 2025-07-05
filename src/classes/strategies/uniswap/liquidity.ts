/* eslint-disable */

import { Address, encodeFunctionData, Hex, parseUnits } from "viem";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { UNISWAP } from "@/constants/protocols/uniswap";
import { ERC20_ABI, NFT_MANAGER_ABI } from "@/constants/abis";
import { getDeadline } from "@/utils/strategies";
import { GetProtocolChains } from "@/types/strategies";
import { Position } from "@/types/position";
import { UniswapV3Swap } from "@/classes/swap";
import { Token } from "@/types/blockchain";
import { getTokenAddress } from "@/utils/coins";

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
  static SLIPPAGE = 50;

  public swapStrategy?: UniswapV3Swap;

  constructor(
    chainId: GetProtocolChains<typeof UNISWAP>,
    swapStrategy?: UniswapV3Swap
  ) {
    super(chainId, UNISWAP, "UniswapV3AddLiquidity");
    if (swapStrategy) this.swapStrategy = swapStrategy;
  }

  async investCalls(
    amount: bigint,
    user: Address,
    asset: Address,
    options: {
      assetName: string;
      pairToken: Token;
    }
  ): Promise<StrategyCall[]> {
    if (!this.swapStrategy)
      throw new Error("UniswapV3AddLiquidity: Swap strategy not implemented");

    const halfAmount = amount / BigInt(2);

    const { calls: swapCalls, quoteAmount } =
      await this.swapStrategy.getSwapCalls(
        options.assetName,
        options.pairToken.name,
        halfAmount,
        user
      );

    const nftManager = this.getAddress("nftManager");
    const deadline = getDeadline();
    const pairTokenAddress = getTokenAddress(options.pairToken, this.chainId);

    const [token0, token1] = sortAddresses(asset, pairTokenAddress);

    let amount0Desired = halfAmount;
    let amount1Desired = parseUnits(quoteAmount, options.pairToken.decimals);

    // Exchanged
    if (token1 === asset) {
      amount0Desired = parseUnits(quoteAmount, options.pairToken.decimals);
      amount1Desired = halfAmount;
    }

    return [
      ...swapCalls,
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
              amount0Min:
                (amount0Desired *
                  BigInt(10000 - UniswapV3AddLiquidity.SLIPPAGE)) /
                BigInt(10000),
              amount1Min:
                (amount1Desired *
                  BigInt(10000 - UniswapV3AddLiquidity.SLIPPAGE)) /
                BigInt(10000),
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
