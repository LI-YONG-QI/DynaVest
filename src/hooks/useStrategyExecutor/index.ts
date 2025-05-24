import { Address } from "viem";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";
import { useChainId, useClient } from "wagmi";
import axios from "axios";
import { waitForTransactionReceipt } from "viem/actions";

import { BaseStrategy } from "@/classes/strategies/baseStrategy";
import { Protocols } from "@/types/strategies";
import { MultiStrategy } from "@/classes/strategies/multiStrategy";

export function useStrategyExecutor() {
  const { client } = useSmartWallets();
  const chainId = useChainId();
  const publicClient = useClient();

  const user = useMemo(() => {
    return client?.account?.address || null;
  }, [client?.account?.address]);

  async function execute<T extends Protocols>(
    strategy: BaseStrategy<T> | MultiStrategy,
    amount: bigint,
    asset?: Address
  ): Promise<string> {
    if (!client || !publicClient) throw new Error("Client not available");
    if (!user) throw new Error("Smart wallet account not found");

    await client.switchChain({ id: chainId });

    // Get calls from strategy
    const calls = await strategy.buildCalls(amount, user, asset);

    // Execute the calls
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

    // TODO: doesn't process MultiStrategy yet
    if (strategy instanceof BaseStrategy) {
      axios.put("/api/user", {
        address: user,
        transactions: [
          {
            hash: txHash,
            chainId,
            strategy: strategy.metadata.protocol,
            type: strategy.metadata.type,
            amount: amount.toString(),
            icon: strategy.metadata.icon,
            tokenName: "USDC",
          },
        ],
      });
    } else if (strategy instanceof MultiStrategy) {
      // TODO: rename
      const transactions = strategy.strategies.map((strategy) => {
        return {
          hash: txHash,
          chainId,
          strategy: strategy.strategy.metadata.protocol,
          type: strategy.strategy.metadata.type,
          amount: (
            (amount * BigInt(strategy.allocation)) /
            BigInt(100)
          ).toString(),
          icon: strategy.strategy.metadata.icon,
          tokenName: "USDC",
        };
      });

      axios.put("/api/user", {
        address: user,
        transactions,
      });
    }

    return txHash;
  }

  async function waitForUserOp(userOp: `0x${string}`): Promise<string> {
    if (!client || !publicClient) {
      throw new Error("Smart wallet client not available");
    }

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

  return {
    user,
    execute,
    waitForUserOp,
    isReady: !!client && !!user,
  };
}
