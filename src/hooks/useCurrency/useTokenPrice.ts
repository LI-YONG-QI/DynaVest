import { useAssets } from "@/contexts/AssetsContext";

/**
 * Hook 用於從 AssetsContext 獲取特定 token 的價格
 * 取代了原來的 useCurrencyPrice，實現價格邏輯的解耦
 */
export function useTokenPrice(tokenName: string) {
  const { assetsBalance, pricesQuery } = useAssets();

  return {
    data: assetsBalance.find((t) => t.token.name === tokenName)?.value,
    isLoading: pricesQuery.isLoading,
    isError: pricesQuery.isError,
    error: pricesQuery.error,
  };
}
