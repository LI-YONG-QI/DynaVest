import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { getBalance } from "@wagmi/core";
import { useQuery } from "@tanstack/react-query";

import { wagmiConfig as config } from "@/providers/config";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { Token } from "@/types";
import { COINGECKO_IDS } from "@/constants/coins";
import { fetchTokensPrices as fetchTokensPriceFromCoinGecko } from "../useCurrency/utils";

export interface TokenData {
  token: Token;
  balance: number;
  value: number;
  price: number;
}

export default function useCurrencies(tokens: Token[]) {
  const { client } = useSmartWallets();
  const chainId = useChainId();

  // Initialize with empty data
  const [initialTokensData, setInitialTokensData] = useState<TokenData[]>([]);

  const priceQuery = useQuery({
    queryKey: ["tokenPrices", chainId, tokens.map((t) => t.name).join(",")],
    queryFn: () => fetchTokensPriceFromCoinGecko(tokens),
    enabled: tokens.length > 0 && !!client,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      const emptyTokensData = tokens.map((token) => ({
        token,
        balance: 0,
        price: 0,
        value: 0,
      }));
      setInitialTokensData(emptyTokensData);
    }
  }, [tokens]);

  // Function to fetch token prices
  const fetchTokenPrices = useCallback(
    async (tokensData: TokenData[]): Promise<TokenData[]> => {
      if (!tokens || tokens.length === 0) return tokensData;

      const { data: pricesResponse } = priceQuery;
      // Handle price fetch error
      if (!pricesResponse || pricesResponse.isError) return tokensData;

      // Create a new array with updated prices
      const updatedTokensData = tokensData.map((tokenData) => {
        const id = COINGECKO_IDS[tokenData.token.name];
        if (id && pricesResponse[id].usd) {
          return {
            ...tokenData,
            price: pricesResponse[id].usd,
          };
        }
        return tokenData;
      });

      return updatedTokensData;
    },
    [tokens, priceQuery]
  );

  // Function to fetch token balances
  const fetchTokenBalances = useCallback(
    async (tokensData: TokenData[]): Promise<TokenData[]> => {
      if (!client || !tokens || tokens.length === 0) {
        return tokensData;
      }

      await client.switchChain({ id: chainId });
      const user = client.account.address;

      if (!user) {
        return tokensData;
      }

      // Create a copy of tokensData to update
      const updatedTokensData = [...tokensData];

      // Fetch balances in parallel - use tokensData to match tokens with their TokenData objects
      const balancePromises = updatedTokensData.map(
        async (tokenData, index) => {
          const token = tokenData.token;
          const params = {
            address: user,
            ...(token.isNativeToken ? {} : { token: token.chains?.[chainId] }),
          };

          const { value, decimals } = await getBalance(config, params);
          updatedTokensData[index].balance = Number(
            formatUnits(value, decimals)
          );

          // Calculate value if price exists
          if (updatedTokensData[index].price) {
            updatedTokensData[index].value =
              updatedTokensData[index].balance *
              updatedTokensData[index].price!;
          }
        }
      );

      await Promise.all(balancePromises);

      return updatedTokensData;
    },
    [client, tokens, chainId]
  );

  // Main function that handles fetching both balances and prices
  const fetchTokenData = useCallback(async () => {
    if (!tokens || tokens.length === 0) {
      return [] as TokenData[];
    }

    // Step 1: Create initial tokens data
    const tokensData: TokenData[] = tokens.map((token) => ({
      token,
      balance: 0,
      price: 0,
      value: 0,
    }));

    // Step 2: Fetch prices
    const tokensWithPrices = await fetchTokenPrices(tokensData);

    // Step 3: Fetch balances and calculate values
    const tokensWithBalancesAndPrices = await fetchTokenBalances(
      tokensWithPrices
    );

    return tokensWithBalancesAndPrices;
  }, [tokens, fetchTokenPrices, fetchTokenBalances]);

  // Use a single React Query for fetching and caching all token data
  return useQuery({
    queryKey: ["tokenData", chainId, tokens.map((t) => t.name).join(",")],
    queryFn: fetchTokenData,
    enabled: tokens.length > 0 && !!client,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    placeholderData: initialTokensData,
    retry: 2,
  });
}
