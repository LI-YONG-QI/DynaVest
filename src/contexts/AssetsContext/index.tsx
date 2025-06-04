import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { Address, encodeFunctionData, Hash, parseUnits } from "viem";
import { useChainId } from "wagmi";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import axios from "axios";
import {
  useMutation,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";

import useCurrencies, { TokenData } from "@/hooks/useCurrencies";
import { Token } from "@/types";
import { Position } from "@/types/position";
import { ERC20_ABI } from "@/constants";
import { SUPPORTED_TOKENS } from "@/constants/profile";
import type { SupportedChainIds } from "@/providers/config";
import { usePositions } from "./usePositions";
import { useProfits } from "./useProfits";

interface AssetsContextType {
  tokensQuery: UseQueryResult<TokenData[], Error>;
  positionsQuery: UseQueryResult<Position[], Error>;
  withdrawAsset: UseMutationResult<Hash, Error, WithdrawAssetParams>;
  updateTotalValue: UseMutationResult<void, Error, void>;
  profitsQuery: UseQueryResult<number[], Error>;
  totalValue: number;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function useAssets() {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
}

interface AssetsProviderProps {
  children: ReactNode;
  tokens?: Token[];
}

interface WithdrawAssetParams {
  asset: Token;
  amount: string;
  to: Address;
}

export function AssetsProvider({ children }: AssetsProviderProps) {
  const chainId = useChainId() as SupportedChainIds;
  const tokensWithChain = SUPPORTED_TOKENS[chainId];
  const positionsQuery = usePositions();
  const profitsQuery = useProfits(positionsQuery.data || []);

  const { client } = useSmartWallets();
  const tokensQuery = useCurrencies(tokensWithChain);

  const totalValue = useMemo(() => {
    return tokensQuery.data?.reduce((acc, token) => acc + token.value, 0) || 0;
  }, [tokensQuery]);

  const updateTotalValue = useMutation({
    mutationFn: async () => {
      const user = client?.account.address;

      if (!user) throw new Error("User not found");
      if (!tokensQuery.isPlaceholderData) {
        const totalValue =
          tokensQuery.data?.reduce((acc, token) => acc + token.value, 0) || 0;

        await axios.patch<{ success: boolean }>(
          `${process.env.NEXT_PUBLIC_CHATBOT_URL}/users/update_total/${user}`,
          {
            total_value: totalValue,
          }
        );
      }
    },
  });

  const withdrawAsset = useMutation({
    mutationFn: async ({ asset, amount, to }: WithdrawAssetParams) => {
      if (!client) throw new Error("Client not found");

      await client.switchChain({ id: chainId });
      const decimals = asset.decimals || 6;
      const amountInBaseUnits = parseUnits(amount, decimals);

      let tx: Hash;
      if (asset.isNativeToken) {
        tx = await client.sendTransaction({
          to,
          value: amountInBaseUnits,
        });
      } else {
        tx = await client.sendTransaction({
          to: asset.chains?.[chainId],
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [to, amountInBaseUnits],
          }),
        });
      }

      return tx;
    },
  });

  const value = {
    withdrawAsset,
    positionsQuery,
    tokensQuery,
    profitsQuery,
    totalValue,
    updateTotalValue,
  };

  return (
    <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
  );
}
