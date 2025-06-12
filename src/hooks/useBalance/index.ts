import { useCallback } from "react";
import { useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

import { Token } from "@/types";
import { useAssets } from "@/contexts/AssetsContext";
import { fetchTokenBalance } from "./utils";

/**
 * @notice fetch smart wallet balance of the token in current chain
 * @param token
 * @returns balance of the token
 */
export default function useBalance(token: Token) {
  const { client } = useSmartWallets();
  const { smartWallet } = useAssets();

  const chainId = useChainId();

  // Fetch balance function to be used with useQuery
  const fetchBalance = useCallback(async () => {
    if (!smartWallet) return;

    const { value: amount } = await fetchTokenBalance(
      token,
      smartWallet,
      chainId
    );
    return amount;
  }, [smartWallet, token, chainId]);

  // Use React Query for fetching and caching the balance
  const {
    data: balance = BigInt(0),
    isLoading: isLoadingBalance,
    refetch,
    isError,
    isLoadingError,
    error,
  } = useQuery({
    queryKey: ["tokenBalance", smartWallet, token.name, chainId],
    queryFn: fetchBalance,
    enabled: !!client,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    placeholderData: BigInt(0),
  });

  return {
    refetch,
    balance,
    isError,
    error,
    isLoadingBalance,
    isLoadingError,
  };
}
