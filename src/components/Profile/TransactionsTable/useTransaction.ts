import axios from "axios";
import { useChainId } from "wagmi";

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers";

export type GetTransactionResponse = {
  transaction_id: string;
  created_at: string;
  strategy: string;
  hash: string;
  amount: number;
  chain_id: number;
  token_name: string;
};

export type AddTransactionRequest = {
  address: string;
  chain_id: number;
  strategy: string;
  hash: string;
  amount: number;
  token_name: string;
};

export const useTransaction = () => {
  const { client } = useSmartWallets();
  const chainId = useChainId();

  const addTx = useMutation({
    mutationFn: async (tx: AddTransactionRequest) => {
      await axios.post(
        `${process.env.NEXT_PUBLIC_CHATBOT_URL}/addTransaction`,
        tx
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", client?.account.address, chainId],
      });
    },
  });

  const transactions = useQuery({
    queryKey: ["transactions", client?.account.address, chainId],
    queryFn: async () => {
      const response = await axios.get<GetTransactionResponse[]>(
        `${process.env.NEXT_PUBLIC_CHATBOT_URL}/transactions/${client?.account.address}`
      );

      const txs = response.data;
      const filteredTxs = txs.filter((tx) => tx.chain_id === chainId);
      return filteredTxs;
    },
    enabled: !!client?.account.address,
    staleTime: 1000 * 60 * 5,
  });

  return {
    transactions,
    addTx,
  };
};
