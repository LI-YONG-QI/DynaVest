import { useCallback } from "react";
import { getBalance } from "@wagmi/core";
import { useChainId } from "wagmi";
import { Address } from "viem";
import { base } from "viem/chains";
import { useQuery } from "@tanstack/react-query";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

import { Token } from "@/types";
import { wagmiConfig as config } from "@/providers/config";

async function fetchTokenBalance(
  token: Token,
  user: Address,
  chainId: number = base.id
) {
  if (!token.chains?.[chainId] && !token.isNativeToken) {
    throw new Error("Token not supported on this chain");
  }

  const params = {
    address: user,
    ...(token.isNativeToken ? {} : { token: token.chains?.[chainId] }),
  };

  const balance = await getBalance(config, params);
  return balance;
}

export default function useCurrency(token: Token) {
  const { client } = useSmartWallets();
  const chainId = useChainId();
  const user = client?.account.address;

  // Fetch balance function to be used with useQuery
  const fetchBalance = useCallback(async () => {
    if (!user) return;

    const { value: amount } = await fetchTokenBalance(token, user, chainId);
    return amount;
  }, [user, token, chainId]);

  // Use React Query for fetching and caching the balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch,
    isError,
    isLoadingError,
    error,
  } = useQuery({
    queryKey: ["tokenBalance", user, token.name, chainId],
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
