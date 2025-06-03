import { Address, encodeFunctionData } from "viem";
import { readContract } from "@wagmi/core";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { ERC20_ABI, V3_SWAP_ROUTER_ABI } from "@/constants/abis";
import { UNISWAP_CONTRACTS } from "@/constants/protocols/uniswap";
import { Token } from "@/types/blockchain";
import { wagmiConfig } from "@/providers/config";

/**
 * @notice swap nativeToken to wstETH
 * @notice Ethereum: ETH -> wstETH
 * @notice BSC: BNB -> wbETH
 */

export class UniswapV3SwapLST extends BaseStrategy<typeof UNISWAP_CONTRACTS> {
  constructor(
    chainId: number,
    public readonly nativeToken: Token,
    public readonly lstToken: Token
  ) {
    super(chainId, UNISWAP_CONTRACTS, "UniswapV3SwapLST");
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

  async getProfit(data: {
    user: Address;
    amount: number;
    underlyingAsset: Address;
  }) {
    const { amount } = data;
    return amount * 2.8;
  }
}
