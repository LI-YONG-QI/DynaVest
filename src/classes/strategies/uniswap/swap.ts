import { type Address, encodeFunctionData } from "viem";

import { UNISWAP } from "@/constants/protocols/uniswap";
import { StrategyCall } from "../baseStrategy";
import { GetProtocolChains } from "@/types/strategies";
import { getRoute } from "@/hooks/useSwap";
import { ERC20_ABI } from "@/constants/abis/erc20";
import { getTokenAddress, getTokenByName } from "@/utils/coins";

export class UniswapV3Swap {
  static SLIPPAGE = 50;

  constructor(public readonly chainId: GetProtocolChains<typeof UNISWAP>) {}

  async getSwapCalls(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    recipient: Address
  ): Promise<{
    calls: StrategyCall[];
    inputAmount: string;
    outputAmount: string;
  }> {
    const route = await getRoute({
      tokenIn,
      tokenOut,
      recipient,
      slippage: UniswapV3Swap.SLIPPAGE.toString(),
      amountIn: amountIn.toString(),
      chainId: this.chainId.toString(),
    });

    const inputAmount = route.trade.inputAmount.toExact();
    const outputAmount = route.trade.outputAmount.toExact();

    const swapRouter = UNISWAP.contracts[this.chainId].swapRouter;
    const tokenAddress = getTokenAddress(getTokenByName(tokenIn), this.chainId);

    if (!route.methodParameters?.calldata) throw new Error("No calldata found");

    return {
      calls: [
        {
          to: tokenAddress,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "approve",
            args: [swapRouter, amountIn],
          }),
        },
        {
          to: swapRouter,
          data: route.methodParameters.calldata as `0x${string}`,
        },
      ],
      inputAmount,
      outputAmount,
    };
  }
}
