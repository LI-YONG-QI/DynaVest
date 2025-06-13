import { Address, encodeFunctionData } from "viem";
import { readContract } from "@wagmi/core";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { ERC20_ABI, V3_SWAP_ROUTER_ABI } from "@/constants/abis";
import { UNISWAP } from "@/constants/protocols/uniswap";
import { Token } from "@/types/blockchain";
import { wagmiConfig } from "@/providers/config";
import { Position } from "@/types/position";

/**
 * @notice swap nativeToken to wstETH
 * @notice Ethereum: ETH -> wstETH
 * @notice BSC: BNB -> wbETH
 */
export class UniswapV3SwapLST extends BaseStrategy {
  constructor(
    chainId: number,
    public readonly nativeToken: Token,
    public readonly lstToken: Token
  ) {
    super(chainId, UNISWAP, "UniswapV3SwapLST");
  }

  async investCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset)
      throw new Error("UniswapV3SwapLST: Native token doesn't support yet.");

    const swapRouter = this.getAddress("swapRouter");
    const tokenOutAddress = this.lstToken.chains![this.chainId];

    return [
      {
        to: asset,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [swapRouter, amount],
        }),
      },
      {
        to: swapRouter,
        data: encodeFunctionData({
          abi: V3_SWAP_ROUTER_ABI,
          functionName: "exactInputSingle",
          args: [
            {
              tokenIn: asset,
              tokenOut: tokenOutAddress,
              fee: 500,
              recipient: user,
              amountIn: amount,
              amountOutMinimum: BigInt(0),
              sqrtPriceLimitX96: BigInt(0),
            },
          ],
        }),
      },
    ];
  }

  /**
   * @notice asset is USDC by default
   */
  async redeemCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset)
      throw new Error("UniswapV3SwapLST: Native token doesn't support yet.");

    const swapRouter = this.getAddress("swapRouter");
    const tokenInAddress = this.lstToken.chains![this.chainId];

    const amountIn = await readContract(wagmiConfig, {
      abi: ERC20_ABI,
      address: tokenInAddress,
      functionName: "balanceOf",
      args: [user],
    });

    return [
      {
        to: tokenInAddress,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [swapRouter, amountIn],
        }),
      },
      {
        to: swapRouter,
        data: encodeFunctionData({
          abi: V3_SWAP_ROUTER_ABI,
          functionName: "exactInputSingle",
          args: [
            {
              tokenIn: tokenInAddress,
              tokenOut: asset,
              fee: 500,
              recipient: user,
              amountIn,
              amountOutMinimum: BigInt(0),
              sqrtPriceLimitX96: BigInt(0),
            },
          ],
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
    const APY = 0.045; // 4.5%
    const dailyRate = APY / 365;
    const profit = position.amount * dailyRate * diffDays;

    return profit;
  }
}
