// 此文件已廢棄，價格邏輯已移至 AssetsContext 中統一管理
// 請使用 useTokenPrice hook 來獲取價格資訊

/*
import { useQuery } from "@tanstack/react-query";
import { Token } from "@/types";

import { fetchTokenPrice } from "./utils";

export function useCurrencyPrice(token: Token) {
  return useQuery({
    queryKey: ["tokenPrice", token.name], // 使用 token.name 作為唯一識別符
    queryFn: () => fetchTokenPrice(token),
    staleTime: 5 * 60 * 1000, // 增加到 5 分鐘，避免過度 fetch
    gcTime: 10 * 60 * 1000, // 增加 garbage collection 時間到 10 分鐘
    placeholderData: 0,
    retry: 2, // 失敗時重試 2 次
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指數退避
    refetchOnWindowFocus: false, // 避免視窗聚焦時重新獲取
    refetchOnReconnect: true, // 網路重連時重新獲取
  });
}
*/
