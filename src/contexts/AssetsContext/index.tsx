import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useState,
} from "react";
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
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";

import useCurrencies, { TokenData } from "@/hooks/useCurrencies";
import { Token } from "@/types";
import { Position } from "@/types/position";
import { ERC20_ABI } from "@/constants";
import { SUPPORTED_TOKENS } from "@/constants/profile";
import type { wagmiConfig } from "@/providers/config";
import { usePositions } from "./usePositions";
import { useProfits } from "./useProfits";
import { addFeesCall, calculateFee } from "@/utils/fee";
import { StrategyCall } from "@/classes/strategies/baseStrategy";
import { useBatchTokenPrices } from "@/contexts/AssetsContext/useBatchTokenPrices";
import { getTokenAddress } from "@/utils/coins";
import { useAddUser } from "@/components/ConnectWalletButton/useAddUser";
import { useOnboardingLogic } from "@/contexts/AssetsContext/useOnboardingLogic";

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
  profitsQuery: UseQueryResult<number[], Error>;
  pricesQuery: UseQueryResult<Record<string, number>, Error>;
  withdrawAsset: UseMutationResult<Hash, Error, WithdrawAssetParams>;
  updateTotalValue: UseMutationResult<void, Error, void>;
  totalValue: number;
  isPriceError: boolean;
  assetsBalance: AssetsBalanceQuery;
  smartWallet: Address | null;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
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
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const chainId = useChainId<typeof wagmiConfig>();
  const tokensWithChain = SUPPORTED_TOKENS[chainId];
  const { client } = useSmartWallets();
  const { user, authenticated } = usePrivy();
  const { mutate: addUser } = useAddUser();

  const pricesQuery = useBatchTokenPrices(tokensWithChain);
  const positionsQuery = usePositions();
  const profitsQuery = useProfits(positionsQuery.data || []);
  const tokensQuery = useCurrencies(tokensWithChain);

  const smartWallet = useMemo(() => {
    return client?.account?.address || null;
  }, [client?.account?.address]);

  const { data: prices, isError: isPriceError } = pricesQuery;
  const assetsBalanceWithValue: AssetBalance[] = useMemo(() => {
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
      data: assetsBalanceWithValue,
      isLoading:
        tokensQuery.isLoading ||
        pricesQuery.isLoading ||
        tokensQuery.isPlaceholderData,
      isError: tokensQuery.isError || pricesQuery.isError,
      error: tokensQuery.error || pricesQuery.error,
      isSuccess: tokensQuery.isSuccess && pricesQuery.isSuccess,
    }),
    [assetsBalanceWithValue, tokensQuery, pricesQuery]
  );

  const totalValue = assetsBalanceWithValue.reduce(
    (acc, t) => acc + t.value,
    0
  );

  const updateTotalValue = useMutation({
    mutationFn: async () => {
      if (!smartWallet) throw new Error("User not found");

      if (tokensQuery.data) {
        await axios.patch<{ success: boolean }>(
          `${process.env.NEXT_PUBLIC_CHATBOT_URL}/users/update_total/${smartWallet}`,
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
      const assetAddress = getTokenAddress(asset, chainId);

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

  /**
   * @dev If the user is new, the loginResponse (from privy login) will be undefined.
   * @dev Use localStorage to store the user's address and login params
   * @dev And add user to database after smart wallet is updated
   */
  useEffect(() => {
    const isNewUser = localStorage.getItem("isNewUser");

    if (isNewUser === "true" && user?.smartWallet?.address) {
      const addUserParams = localStorage.getItem("addUserParams");

      if (addUserParams) {
        const params = JSON.parse(addUserParams);
        params.address = user?.smartWallet?.address; // update user address

        addUser(params, {
          onSuccess: (address) => {
            localStorage.removeItem("isNewUser");
            localStorage.removeItem("addUserParams");

            toast.success(`Login Successfully: ${address}`);
          },
          onError: (error) => {
            toast.error(`Wallet creation failed: ${error}`);
          },
        });
      }
    }
  }, [user?.smartWallet?.address, addUser]);

  // 使用自定義 hook 處理引導邏輯
  useOnboardingLogic({
    tokensQuery,
    pricesQuery,
    totalValue,
    authenticated,
    setIsOnboardingOpen,
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
    smartWallet,
    isOnboardingOpen,
    setIsOnboardingOpen,
  };

  return (
    <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
  );
}
