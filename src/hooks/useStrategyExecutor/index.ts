import { toast } from "react-toastify";
import { Address } from "viem";
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

type PositionResponse = {
  id: string;
  amount: number;
  strategy: string;
  status: string;
};

type PositionParams = {
  address: Address;
  amount: number;
  token_name: string;
  chain_id: number;
  strategy: string;
};

type RedeemParams = {
  strategy: BaseStrategy<Protocols> | MultiStrategy;
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
  strategy: MultiStrategy;
  amount: bigint;
  token: Token;
  positionId?: string;
};

async function updatePosition(positionParams: PositionParams) {
  // TODO: refactor with backend
  const positions = await axios.get(
    `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${positionParams.address}`
  );
  const position = positions.data.find(
    (pos: PositionResponse) =>
      pos.strategy === positionParams.strategy && pos.status === "true"
  );

  if (!position) {
    await axios.post(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/addPosition`,
      positionParams
    );
  } else {
    const newAmount = Number(position.amount) + positionParams.amount;
    await axios.patch(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${position.position_id}`,
      {
        amount: newAmount,
      }
    );
  }
}

async function updatePositions(
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
      await updatePosition(position);
    } catch (error) {
      console.error("Error adding position:", error);
      toast.error("Failed to add position. Please try again.");
    }
  }
}

async function getInvestCalls(
  strategy: BaseStrategy<Protocols> | MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number
) {
  let calls: StrategyCall[];

  if (token.isNativeToken) {
    calls = await strategy.investCalls(amount, user);
  } else {
    calls = await strategy.investCalls(amount, user, token.chains?.[chainId]);
  }

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

async function getRedeemCalls(
  strategy: BaseStrategy<Protocols> | MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number
) {
  let calls: StrategyCall[];

  if (token.isNativeToken) {
    calls = await strategy.redeemCalls(amount, user);
  } else {
    calls = await strategy.redeemCalls(amount, user, token.chains?.[chainId]);
  }

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

// TODO: rename, and encapsulate logic of strategy
// TODO: useStrategy(strategyName: Protocol)
// TODO: duplicate logic of strategy
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

  const redeem = useMutation({
    mutationFn: async ({
      strategy,
      amount,
      token,
      positionId,
    }: RedeemParams) => {
      if (!client || !publicClient) throw new Error("Client not available");
      if (!user) throw new Error("Smart wallet account not found");

      await client.switchChain({ id: chainId });

      const calls = await getRedeemCalls(
        strategy,
        amount,
        user,
        token,
        chainId
      );
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

      await axios.patch(
        `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${positionId}`,
        {
          status: "false",
        }
      );

      return txHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", user] });
    },
  });

  const invest = useMutation({
    mutationFn: async ({ strategy, amount, token }: InvestParams) => {
      if (!client || !publicClient) throw new Error("Client not available");
      if (!user) throw new Error("Smart wallet account not found");

      await client.switchChain({ id: chainId });

      const calls = await getInvestCalls(
        strategy,
        amount,
        user,
        token,
        chainId
      );

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

      await updatePosition({
        address: user,
        amount: Number(amount),
        token_name: token.name,
        chain_id: chainId,
        strategy: strategy.metadata.name,
      });

      return txHash;
    },
  });

  const multiInvest = useMutation({
    mutationFn: async ({ strategy, amount, token }: MultiInvestParams) => {
      if (!client || !publicClient) throw new Error("Client not available");
      if (!user) throw new Error("Smart wallet account not found");

      await client.switchChain({ id: chainId });

      const calls = await getInvestCalls(
        strategy,
        amount,
        user,
        token,
        chainId
      );
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

      await updatePositions(strategy, amount, chainId, user, token.name);
      return txHash;
    },
  });

  return {
    invest,
    multiInvest,
    redeem,
  };
}
