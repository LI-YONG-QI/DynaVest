import { useQuery } from "@tanstack/react-query";
import { SwapRoute } from "@uniswap/smart-order-router";
import { useChainId } from "wagmi";

type SwapParams = {
  tokenIn: string;
  tokenOut: string;
  recipient: string;
  slippage: string;
  amountIn: string;
  chainId: string;
};

export const getRoute = async ({
  tokenIn,
  tokenOut,
  recipient,
  slippage,
  amountIn,
  chainId,
}: SwapParams) => {
  const params = new URLSearchParams({
    tokenIn,
    tokenOut,
    recipient,
    chainId,
    slippage,
    amountIn,
  });

  const response = await fetch(`/api/swap?${params}`, {
    method: "GET",
  });

  return (await response.json()) as SwapRoute;
};

const useSwap = ({
  tokenIn,
  tokenOut,
  recipient,
  slippage,
  amountIn,
}: SwapParams) => {
  const chainId = useChainId();

  return useQuery({
    queryKey: [
      "swap",
      chainId,
      tokenIn,
      tokenOut,
      recipient,
      slippage,
      amountIn,
    ],
    queryFn: async () => {},
  });
};

export default useSwap;
