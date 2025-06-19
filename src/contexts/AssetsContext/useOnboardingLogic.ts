import { useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { UseQueryResult } from "@tanstack/react-query";

interface UseOnboardingLogicProps {
  tokensQuery: UseQueryResult<unknown>;
  pricesQuery: UseQueryResult<unknown>;
  totalValue: number;
  authenticated: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
}

export function useOnboardingLogic({
  tokensQuery,
  pricesQuery,
  totalValue,
  authenticated,
  setIsOnboardingOpen,
}: UseOnboardingLogicProps) {
  const account = useAccount();

  // 檢查 query 是否完成
  const isQuerySettled = (query: UseQueryResult<unknown>) => {
    return (
      query.fetchStatus === "idle" &&
      query.status === "success" &&
      query.isFetched
    );
  };

  const isTokensReady = useMemo(
    () => isQuerySettled(tokensQuery),
    [tokensQuery.fetchStatus, tokensQuery.status, tokensQuery.isFetched]
  );
  const isPricesReady = useMemo(
    () => isQuerySettled(pricesQuery),
    [pricesQuery.fetchStatus, pricesQuery.status, pricesQuery.isFetched]
  );

  // 檢查用戶狀態
  const isUserConnected = useMemo(() => {
    return authenticated && account.status === "connected";
  }, [authenticated, account.status]);

  // 是否應該顯示引導
  const shouldShowOnboarding = useMemo(() => {
    return (
      isTokensReady && isPricesReady && isUserConnected && totalValue === 0
    );
  }, [isTokensReady, isPricesReady, isUserConnected, totalValue]);

  useEffect(() => {
    if (
      shouldShowOnboarding &&
      localStorage.getItem("onboarding-dialog-shown") !== "true"
    )
      setIsOnboardingOpen(true);
  }, [shouldShowOnboarding, setIsOnboardingOpen]);

  return {
    isTokensReady,
    isPricesReady,
    isUserConnected,
    shouldShowOnboarding,
  };
}
