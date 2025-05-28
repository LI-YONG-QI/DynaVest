import { toast } from "react-toastify";
import { Address } from "viem";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";
import { useChainId, useClient } from "wagmi";
import axios from "axios";
import { waitForTransactionReceipt } from "viem/actions";

import { BaseStrategy } from "@/classes/strategies/baseStrategy";
import { Protocols } from "@/types/strategies";
import { MultiStrategy } from "@/classes/strategies/multiStrategy";
import { useMutation } from "@tanstack/react-query";
import { Token } from "@/types/blockchain";
import { StrategyCall } from "@/classes/strategies/baseStrategy";

type PositionParams = {
  address: Address;
  amount: number;
  token_name: string;
  chain_id: number;
  strategy: string;
};

async function addPosition(position: PositionParams) {
  await axios.post(
    `${process.env.NEXT_PUBLIC_CHATBOT_URL}/addPosition`,
    position
  );
}

async function executeStrategy(
  strategy: MultiStrategy,
  amount: bigint,
  chainId: number,
  user: Address,
  tokenName: string = "USDC"
) {
  for (const singleStrategy of strategy.strategies) {
    const position: PositionParams = {
      address: user,
      amount: Number(
        (amount * BigInt(singleStrategy.allocation)) / BigInt(100)
      ),
      token_name: tokenName,
      chain_id: chainId,
      strategy: singleStrategy.strategy.metadata.name,
    };

    try {
      await addPosition(position);
    } catch (error) {
      console.error("Error adding position:", error);
      toast.error("Failed to add position. Please try again.");
    }
  }
}

async function getCalls(
  strategy: BaseStrategy<Protocols> | MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number
) {
  let calls: StrategyCall[];

  if (token.isNativeToken) {
    calls = await strategy.buildCalls(amount, user);
  } else {
    calls = await strategy.buildCalls(amount, user, token.chains?.[chainId]);
  }

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

export function useStrategyExecutor() {
  const { client } = useSmartWallets();
  const chainId = useChainId();
  const publicClient = useClient();

  const user = useMemo(() => {
    return client?.account?.address || null;
  }, [client?.account?.address]);

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

  return useMutation({
    mutationFn: async ({
      strategy,
      amount,
      token,
    }: {
      strategy: BaseStrategy<Protocols> | MultiStrategy;
      amount: bigint;
      token: Token;
    }) => {
      if (!client || !publicClient) throw new Error("Client not available");
      if (!user) throw new Error("Smart wallet account not found");

      await client.switchChain({ id: chainId });

      const calls = await getCalls(strategy, amount, user, token, chainId);
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

      if (strategy instanceof BaseStrategy) {
        await addPosition({
          address: user,
          amount: Number(amount),
          token_name: token.name,
          chain_id: chainId,
          strategy: strategy.metadata.name,
        });
      } else if (strategy instanceof MultiStrategy) {
        await executeStrategy(strategy, amount, chainId, user);
      }

      return txHash;
    },
  });
}
