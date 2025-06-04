import { useCallback } from "react";
import { getBalance } from "@wagmi/core";
import { useChainId } from "wagmi";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { base } from "viem/chains";

import { Token } from "@/types";
import { COINGECKO_IDS } from "@/constants/coins";
import { wagmiConfig as config } from "@/providers/config";

async function _fetchTokenBalance(
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

async function fetchTokenPrice(token: Token) {
  const id = COINGECKO_IDS[token.name];

  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: id,
        vs_currencies: "usd",
      },
    }
  );

  const price = Number(response.data[id].usd);

  return price;
}

export function useCurrencyPrice(token: Token) {
  return useQuery({
    queryKey: ["tokenPrice", token],
    queryFn: () => fetchTokenPrice(token),
    staleTime: 2 * 60 * 1000, // Consider data stale after 30 seconds
  });
}

export default function useCurrency(token: Token) {
  const { client } = useSmartWallets();

  const chainId = useChainId();
  const { data: price = 0 } = useCurrencyPrice(token);

  // Fetch balance function to be used with useQuery
  const fetchBalance = useCallback(async () => {
    const user = client?.account.address;

    if (!user) return;

    const { value: amount } = await _fetchTokenBalance(token, user, chainId);
    return { amount, price };
  }, [client, token, chainId, price]);

  // Use React Query for fetching and caching the balance
  const {
    data: balance = { amount: BigInt(0), price: 0 },
    isLoading: isLoadingBalance,
    refetch,
    isError,
    isLoadingError,
    error,
  } = useQuery({
    queryKey: ["tokenBalance", token],
    queryFn: fetchBalance,
    enabled: !!client && !!price,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    // refetchOnWindowFocus: true,
  });

  // Log errors if any
  return {
    refetch,
    balance,
    isError,
    error,
    isLoadingBalance,
    isLoadingError,
  };
}
