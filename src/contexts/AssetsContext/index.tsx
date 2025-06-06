import React, { createContext, useContext, ReactNode, useMemo } from "react";
import {
  Address,
  encodeFunctionData,
  formatUnits,
  Hash,
  parseUnits,
} from "viem";
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
import { addFeesCall, calculateFee } from "@/utils/fee";
import { StrategyCall } from "@/classes/strategies/baseStrategy";
import { useBatchTokenPrices } from "@/hooks/useCurrency/useBatchTokenPrices";

type AssetBalance = TokenData & {
  value: number;
};

// 新增：包含完整狀態的資產餘額接口
interface AssetsBalanceQuery {
  data: AssetBalance[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

interface AssetsContextType {
  tokensQuery: UseQueryResult<TokenData[], Error>;
  positionsQuery: UseQueryResult<Position[], Error>;
  withdrawAsset: UseMutationResult<Hash, Error, WithdrawAssetParams>;
  updateTotalValue: UseMutationResult<void, Error, void>;
  profitsQuery: UseQueryResult<number[], Error>;
  totalValue: number;
  isPriceError: boolean;
  pricesQuery: UseQueryResult<Record<string, number>, Error>;
  assetsBalance: AssetsBalanceQuery;
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
  const { client } = useSmartWallets();

  const pricesQuery = useBatchTokenPrices(tokensWithChain);
  const positionsQuery = usePositions();
  const profitsQuery = useProfits(positionsQuery.data || []);
  const tokensQuery = useCurrencies(tokensWithChain);

  const { data: prices, isError: isPriceError } = pricesQuery;

  const assetsBalanceData: AssetBalance[] = useMemo(() => {
    return (
      tokensQuery.data?.map((t) => ({
        ...t,
        value:
          Number(formatUnits(t.balance, t.token.decimals)) *
          (prices?.[t.token.name] || 0),
      })) || []
    );
  }, [tokensQuery, prices]);

  // 創建包含完整狀態的 assetsBalance 對象
  const assetsBalance: AssetsBalanceQuery = useMemo(
    () => ({
      data: assetsBalanceData,
      isLoading:
        tokensQuery.isLoading ||
        pricesQuery.isLoading ||
        tokensQuery.isPlaceholderData,
      isError: tokensQuery.isError || pricesQuery.isError,
      error: tokensQuery.error || pricesQuery.error,
      isSuccess: tokensQuery.isSuccess && pricesQuery.isSuccess,
    }),
    [assetsBalanceData, tokensQuery, pricesQuery]
  );

  const totalValue = assetsBalanceData.reduce((acc, t) => acc + t.value, 0);

  const updateTotalValue = useMutation({
    mutationFn: async () => {
      const user = client?.account.address;

      if (!user) throw new Error("User not found");
      if (tokensQuery.data) {
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
      const assetAddress = asset.chains?.[chainId] as Address;

      const { fee, amount: amountWithoutFee } = calculateFee(amountInBaseUnits);
      const feeCall = addFeesCall(assetAddress, asset.isNativeToken, fee);
      let calls: StrategyCall[] = [feeCall];

      if (asset.isNativeToken) {
        calls = [
          {
            to,
            value: amountWithoutFee,
          },
          feeCall,
        ];
      } else {
        calls = [
          {
            to: assetAddress,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "transfer",
              args: [to, amountWithoutFee],
            }),
          },
          feeCall,
        ];
      }

      const tx = await client.sendTransaction(
        {
          calls,
        },
        {
          uiOptions: {
            showWalletUIs: false,
          },
        }
      );

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
    isPriceError,
    pricesQuery,
    assetsBalance,
  };

  return (
    <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
  );
}
