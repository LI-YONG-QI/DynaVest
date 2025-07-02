import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";

type SwapParams = {
  tokenIn: string;
  tokenOut: string;
  recipient: string;
  slippage: number;
  amountIn: string;
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
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append("tokenIn", tokenIn);
      params.append("tokenOut", tokenOut);
      params.append("recipient", recipient);
      params.append("chainId", chainId.toString());
      params.append("slippage", slippage.toString());
      params.append("amountIn", amountIn.toString());

      const response = await fetch(`/api/swap?${params}`, {
        method: "GET",
      });

      return response.json();
    },
  });
};

export default useSwap;
