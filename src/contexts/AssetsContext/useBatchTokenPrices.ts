import { useQuery } from "@tanstack/react-query";

import { Token } from "@/types";
import { fetchTokensPrices } from "../../hooks/useBalance/utils";

export function useBatchTokenPrices(tokens: Token[]) {
  return useQuery({
    queryKey: ["batchTokenPrices", tokens.map((t) => t.name).sort()], // 排序確保 key 一致性
    queryFn: () => fetchTokensPrices(tokens),
    staleTime: 5 * 60 * 1000, // 5 分鐘
    gcTime: 10 * 60 * 1000, // 10 分鐘
    enabled: tokens.length > 0,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: {},
  });
}
