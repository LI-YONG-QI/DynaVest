import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { getBalance } from "@wagmi/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { wagmiConfig as config } from "@/providers/config";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { Token } from "@/types";
import { COINGECKO_IDS } from "@/constants/coins";

export interface TokenData {
  token: Token;
  balance: number;
  value: number;
  price: number;
}

export default function useCurrencies(tokens: Token[]) {
  const { client, getClientForChain } = useSmartWallets();
  const chainId = useChainId();

  // Initialize with empty data
  const [initialTokensData, setInitialTokensData] = useState<TokenData[]>([]);

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

      try {
        const tokenIds = tokens
          .map((token) => COINGECKO_IDS[token.name])
          .filter((id) => !!id);

        if (tokenIds.length > 0) {
          const priceResponse = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price",
            {
              params: {
                ids: tokenIds.join(","),
                vs_currencies: "usd",
              },
            }
          );

          // Create a new array with updated prices
          const updatedTokensData = tokensData.map((tokenData) => {
            const id = COINGECKO_IDS[tokenData.token.name];
            if (id && priceResponse.data[id]) {
              return {
                ...tokenData,
                price: priceResponse.data[id].usd,
              };
            }
            return tokenData;
          });

          return updatedTokensData;
        }

        // No token IDs to fetch prices for
        return tokensData;
      } catch (error) {
        console.error("Failed to fetch token prices:", error);
        // Return original data if anything fails
        return tokensData;
      }
    },
    [tokens]
  );

  // Function to fetch token balances
  const fetchTokenBalances = useCallback(
    async (tokensData: TokenData[]): Promise<TokenData[]> => {
      if (!client || !tokens || tokens.length === 0) {
        return tokensData;
      }

      try {
        const chainClient = await getClientForChain({ id: chainId });
        const user = chainClient?.account.address;

        if (!user) {
          return tokensData;
        }

        // Create a copy of tokensData to update
        const updatedTokensData = [...tokensData];

        // Fetch balances in parallel - use tokensData to match tokens with their TokenData objects
        const balancePromises = updatedTokensData.map(
          async (tokenData, index) => {
            try {
              const token = tokenData.token;
              const params = {
                address: user,
                ...(token.isNativeToken
                  ? {}
                  : { token: token.chains?.[chainId] }),
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
            } catch (error) {
              console.error(
                `Error fetching balance for ${tokenData.token.name}:`,
                error
              );
            }
          }
        );

        await Promise.all(balancePromises);

        return updatedTokensData;
      } catch (error) {
        console.error("Error fetching balances:", error);
        return tokensData;
      }
    },
    [client, tokens, chainId, getClientForChain]
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
      price: undefined,
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
  const {
    data: tokensData = initialTokensData,
    isLoading,
    isError,
    error,
    refetch: refreshData,
  } = useQuery({
    queryKey: ["tokenData", chainId, tokens.map((t) => t.name).join(",")],
    queryFn: fetchTokenData,
    enabled: tokens.length > 0 && !!client,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000, // Refresh data every 2 minutes
    placeholderData: initialTokensData,
    refetchOnMount: true, // Force refetch on mount
  });

  // Log errors if any
  useEffect(() => {
    if (isError) {
      console.error("Error fetching token data:", error);
    }
  }, [isError, error]);

  return {
    tokensData,
    isLoading, // TODO: not useful
    refreshData,
    // Helper methods
    getTokenBalance: (name: string) =>
      tokensData.find((t) => t.token.name === name)?.balance || 0,
    getTokenPrice: (name: string) =>
      tokensData.find((t) => t.token.name === name)?.price,
    getTokenValue: (name: string) =>
      tokensData.find((t) => t.token.name === name)?.value || 0,
  };
}
