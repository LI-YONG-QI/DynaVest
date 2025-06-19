import { useCallback } from "react";
import { useChainId } from "wagmi";
import { getBalance } from "@wagmi/core";
import { useQuery } from "@tanstack/react-query";

import { wagmiConfig as config } from "@/providers/config";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { Token } from "@/types";
import { getTokenAddress } from "@/utils/coins";

export interface TokenData {
  token: Token;
  balance: bigint;
}

export default function useCurrencies(tokens: Token[]) {
  const { client } = useSmartWallets();
  const chainId = useChainId();

  const initialTokensData = tokens.map((token) => ({
    token,
    balance: BigInt(0),
  }));

  const fetchBalances = useCallback(
    async (tokensData: TokenData[]): Promise<TokenData[]> => {
      if (!client || !tokens || tokens.length === 0) return tokensData;

      await client.switchChain({ id: chainId });
      const user = client.account.address;
      if (!user) return tokensData;

      const balancePromises = tokensData.map(async (tokenData, index) => {
        const token = tokenData.token;

        const params = {
          address: user,
          ...(token.isNativeToken
            ? {}
            : { token: getTokenAddress(token, chainId) }),
        };

        const { value } = await getBalance(config, params);
        tokensData[index].balance = value;
      });

      await Promise.all(balancePromises);
      return tokensData;
    },
    [client, tokens, chainId]
  );

  // Use a single React Query for fetching and caching all token data
  return useQuery({
    queryKey: ["tokenData", chainId, tokens.map((t) => t.name).join(",")],
    queryFn: () => fetchBalances(initialTokensData),
    enabled: tokens.length > 0 && !!client,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    placeholderData: initialTokensData,
    retry: 2,
    throwOnError: (error) => {
      console.error("TokensQuery", error);
      return false;
    },
  });
}
