import { Address, encodeFunctionData } from "viem";

import { BaseStrategy, StrategyCall } from "../baseStrategy";

import { V3_SWAP_ROUTER_ABI } from "@/constants/abis";
import { getWrappedToken } from "@/constants/coins";
import { UNISWAP_CONTRACTS } from "@/constants/protocols/uniswap";
import { Token } from "@/types/blockchain";

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
    super(chainId, UNISWAP_CONTRACTS, {
      name: "Uniswap V3 Swap LST",
      type: "Trading",
      protocol: "Uniswap V3",
      description: "Swap native tokens to LST on Uniswap V3",
    });
  }

  async buildCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    const swapRouter = this.getAddress("swapRouter");

    if (!asset) {
      const tokenIn = getWrappedToken(this.nativeToken);
      const tokenInAddress = tokenIn.chains![this.chainId];
      const tokenOutAddress = this.lstToken.chains![this.chainId];

      return [
        {
          to: swapRouter,
          value: amount,
          data: encodeFunctionData({
            abi: V3_SWAP_ROUTER_ABI,
            functionName: "exactInputSingle",
            args: [
              {
                tokenIn: tokenInAddress,
                tokenOut: tokenOutAddress,
                fee: 100,
                recipient: user,
                amountIn: amount,
                amountOutMinimum: BigInt(0),
                sqrtPriceLimitX96: BigInt(0),
              },
            ],
          }),
        },
      ];
    } else {
      throw new Error("UniswapV3SwapLST: ERC20 doesn't support yet.");
    }
  }
}
