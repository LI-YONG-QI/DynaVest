import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";
import { useChainId, useClient } from "wagmi";
import axios from "axios";
import { waitForTransactionReceipt } from "viem/actions";
import { useMutation } from "@tanstack/react-query";

import { BaseStrategy } from "@/classes/strategies/baseStrategy";
import { Protocols } from "@/types/strategies";
import { MultiStrategy } from "@/classes/strategies/multiStrategy";
import { Token } from "@/types/blockchain";
import { StrategyCall } from "@/classes/strategies/baseStrategy";
import { queryClient } from "@/providers";
import { useTransaction } from "@/components/Profile/TransactionsTable/useTransaction";
import {
  getRedeemCalls,
  getInvestCalls,
  updatePosition,
  type PositionParams,
} from "./utils";
import { Address } from "viem";

type RedeemParams = {
  strategy: BaseStrategy<Protocols>;
  amount: bigint;
  token: Token;
  positionId: string;
};

type InvestParams = {
  strategy: BaseStrategy<Protocols>;
  amount: bigint;
  token: Token;
};

type MultiInvestParams = {
  multiStrategy: MultiStrategy;
  amount: bigint;
  token: Token;
  positionId?: string;
};

// TODO: rename, and encapsulate logic of strategy
// TODO: useStrategy(strategyName: Protocol)
export function useStrategyExecutor() {
  const { client } = useSmartWallets();
  const chainId = useChainId();
  const publicClient = useClient();
  const { addTx } = useTransaction();

  const user = useMemo(() => {
    return client?.account?.address || null;
  }, [client?.account?.address]);

  async function updatePositions(
    txHash: string,
    multiStrategy: MultiStrategy,
    amount: bigint,
    chainId: number,
    user: Address,
    tokenName: string = "USDC"
  ) {
    for (const singleStrategy of multiStrategy.strategies) {
      const splitAmount = Number(
        (amount * BigInt(singleStrategy.allocation)) / BigInt(100)
      );

      const position: PositionParams = {
        address: user,
        amount: splitAmount,
        token_name: tokenName,
        chain_id: chainId,
        strategy: singleStrategy.strategy.name,
      };
      try {
        await updatePosition(position);
        await addTx.mutateAsync({
          address: user,
          chain_id: chainId,
          strategy: singleStrategy.strategy.name,
          hash: txHash,
          amount: splitAmount,
          token_name: tokenName,
        });
      } catch (error) {
        console.error("Error adding position:", error);
      }
    }
  }

  async function sendAndWaitTransaction(calls: StrategyCall[]) {
    async function waitForUserOp(userOp: `0x${string}`): Promise<string> {
      if (!publicClient) throw new Error("Public client not available");

      const { transactionHash, status } = await waitForTransactionReceipt(
        publicClient,
        {
          hash: userOp,
        }
      );

      if (status === "success") {
        return transactionHash;
      } else {
        throw new Error(
          `Strategy execution reverted with txHash: ${transactionHash}`
        );
      }
    }

    if (!client) throw new Error("Client not available");

    await client.switchChain({ id: chainId });
    const userOp = await client.sendTransaction(
      {
        calls,
      },
      {
        uiOptions: {
          showWalletUIs: false,
        },
      }
    );
    const txHash = await waitForUserOp(userOp);
    return txHash;
  }

  const redeem = useMutation({
    mutationFn: async ({
      strategy,
      amount,
      token,
      positionId,
    }: RedeemParams) => {
      if (!user) throw new Error("Smart wallet account not found");

      const calls = await getRedeemCalls(
        strategy,
        amount,
        user,
        token,
        chainId
      );
      const txHash = await sendAndWaitTransaction(calls);

      // Update the status of position
      await axios.patch(
        `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${positionId}`,
        {
          status: "false",
        }
      );

      await addTx.mutateAsync({
        address: user,
        chain_id: chainId,
        strategy: strategy.name,
        hash: txHash,
        amount: Number(amount),
        token_name: token.name,
      });

      return txHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", user] });
    },
  });

  const invest = useMutation({
    mutationFn: async ({ strategy, amount, token }: InvestParams) => {
      if (!user) throw new Error("Smart wallet account not found");

      const calls = await getInvestCalls(
        strategy,
        amount,
        user,
        token,
        chainId
      );
      const txHash = await sendAndWaitTransaction(calls);

      await updatePosition({
        address: user,
        amount: Number(amount),
        token_name: token.name,
        chain_id: chainId,
        strategy: strategy.name,
      });
      await addTx.mutateAsync({
        address: user,
        chain_id: chainId,
        strategy: strategy.name,
        hash: txHash,
        amount: Number(amount),
        token_name: token.name,
      });

      return txHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", user] });
    },
  });

  const multiInvest = useMutation({
    mutationFn: async ({ multiStrategy, amount, token }: MultiInvestParams) => {
      if (!user) throw new Error("Smart wallet account not found");

      const calls = await getInvestCalls(
        multiStrategy,
        amount,
        user,
        token,
        chainId
      );
      const txHash = await sendAndWaitTransaction(calls);

      await updatePositions(
        txHash,
        multiStrategy,
        amount,
        chainId,
        user,
        token.name
      );
      return txHash;
    },
  });

  return {
    invest,
    multiInvest,
    redeem,
  };
}
