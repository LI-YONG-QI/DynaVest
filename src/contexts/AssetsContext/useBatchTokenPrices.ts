import { useQuery } from "@tanstack/react-query";

import { Token } from "@/types";
import { fetchTokensPrices } from "../../hooks/useBalance/utils";

export function useBatchTokenPrices(tokens: Token[]) {
  return useQuery({
    queryKey: ["batchTokenPrices", tokens.map((t) => t.name).sort()], // 排序確保 key 一致性
    queryFn: () => fetchTokensPrices(tokens),
    enabled: tokens.length > 0,
    placeholderData: {},

    // Set throwOnError to false to avoid throwing error when fetching prices
    throwOnError: (error) => {
      console.error("BatchTokenPrices", error);
      return false;
    },
  });
}
