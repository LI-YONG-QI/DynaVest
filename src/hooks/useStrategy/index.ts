import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";
import { useChainId, useClient } from "wagmi";
import axios from "axios";
import { formatUnits, type Address } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useMutation } from "@tanstack/react-query";

import { BaseStrategy } from "@/classes/strategies/baseStrategy";
import { Protocol, Strategy } from "@/types/strategies";
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
  getInvestCallsWithSwap,
} from "./utils";
import { addFeesCall, calculateFee } from "@/utils/fee";
import { getTokenAddress, getTokenByName } from "@/utils/coins";
import { getStrategy } from "@/utils/strategies";
import { getRoute } from "../useSwap";
import { UniswapV3AddLiquidityParams } from "@/classes/strategies/uniswap/liquidity";
import { get } from "http";

type RedeemParams = {
  strategy: BaseStrategy<Protocol>;
  amount: bigint;
  token: Token;
  positionId: string;
};

type InvestParams = {
  strategyId: Strategy;
  amount: bigint;
  token: Token;
};

type MultiInvestParams = {
  multiStrategy: MultiStrategy;
  amount: bigint;
  token: Token;
  positionId?: string;
};

type MultiInvestWithSwapParams = MultiInvestParams & {
  swapOptions: {
    tokenOut: Token;
    slippage: string;
  };
};

export function useStrategy() {
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
      const token = getTokenByName(tokenName);

      const splitAmount = Number(
        formatUnits(
          (amount * BigInt(singleStrategy.allocation)) / BigInt(100),
          token.decimals
        )
      );

      const position: PositionParams = {
        address: user,
        amount: splitAmount,
        token_name: tokenName,
        chain_id: chainId,
        strategy: singleStrategy.strategy.name,
      };

      await updatePosition(position);
      await addTx.mutateAsync({
        address: user,
        chain_id: chainId,
        strategy: singleStrategy.strategy.name,
        hash: txHash,
        amount: splitAmount,
        token_name: tokenName,
      });
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

      const { fee, amount: amountWithoutFee } = calculateFee(amount);
      const calls = await getRedeemCalls(
        strategy,
        amountWithoutFee,
        user,
        token,
        chainId
      );

      const feeCall = addFeesCall(
        getTokenAddress(token, chainId),
        token.isNativeToken,
        fee
      );
      calls.push(feeCall);

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
        amount: Number(formatUnits(amountWithoutFee, token.decimals)),
        token_name: token.name,
      });

      return txHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", user] });
    },
  });

  const invest = useMutation({
    mutationFn: async ({ strategyId, amount, token }: InvestParams) => {
      if (!user) throw new Error("Smart wallet account not found");

      const strategy = getStrategy(strategyId, chainId);

      const { fee, amount: amountWithoutFee } = calculateFee(amount);
      const calls = await getInvestCalls(
        strategy,
        amountWithoutFee,
        user,
        token,
        chainId
      );

      const feeCall = addFeesCall(
        getTokenAddress(token, chainId),
        token.isNativeToken,
        fee
      );

      calls.push(feeCall);
      const txHash = await sendAndWaitTransaction(calls);

      await updatePosition({
        address: user,
        amount: Number(formatUnits(amountWithoutFee, token.decimals)),
        token_name: token.name,
        chain_id: chainId,
        strategy: strategy.name,
      });

      await addTx.mutateAsync({
        address: user,
        chain_id: chainId,
        strategy: strategy.name,
        hash: txHash,
        amount: Number(formatUnits(amountWithoutFee, token.decimals)),
        token_name: token.name,
      });

      return txHash;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", user] });
    },
  });

  const multiInvestWithSwap = useMutation({
    mutationFn: async ({
      multiStrategy,
      amount,
      token,
      swapOptions,
    }: MultiInvestWithSwapParams) => {
      if (!user) throw new Error("Smart wallet account not found");
      if (!multiStrategy.isExistAddLiquidity()) {
        throw new Error("Multi strategy doesn't have add liquidity");
      }

      const { fee, amount: amountWithoutFee } = calculateFee(amount);
      let calls: StrategyCall[] = [];
      const halfAmount = amount / BigInt(2);

      const route = await getRoute({
        tokenIn: token.name,
        tokenOut: swapOptions.tokenOut.name,
        recipient: user,
        slippage: swapOptions.slippage,
        amountIn: halfAmount.toString(),
        chainId: chainId.toString(),
      });

      const { methodParameters, trade } = route;
      const inputAmount = trade.inputAmount.toExact();
      const outputAmount = trade.outputAmount.toExact();

      const liquidityParams: UniswapV3AddLiquidityParams = {
        swapCalldata: methodParameters?.calldata as `0x${string}`,
        swapAsset: getTokenAddress(swapOptions.tokenOut, chainId),
        fee: 100,
        amount0Desired: BigInt(inputAmount),
        amount1Desired: BigInt(outputAmount),
        slippage: Number(swapOptions.slippage),
      };

      calls = await getInvestCallsWithSwap(
        multiStrategy,
        amountWithoutFee,
        user,
        token,
        chainId,
        liquidityParams
      );

      const feeCall = addFeesCall(
        getTokenAddress(token, chainId),
        token.isNativeToken,
        fee
      );
      calls.push(feeCall);

      const txHash = await sendAndWaitTransaction(calls);
      await updatePositions(
        txHash,
        multiStrategy,
        amountWithoutFee,
        chainId,
        user,
        token.name
      );

      return txHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", user] });
    },
  });

  const multiInvest = useMutation({
    mutationFn: async ({ multiStrategy, amount, token }: MultiInvestParams) => {
      if (!user) throw new Error("Smart wallet account not found");

      const { fee, amount: amountWithoutFee } = calculateFee(amount);
      const calls = await getInvestCalls(
        multiStrategy,
        amountWithoutFee,
        user,
        token,
        chainId
      );

      const feeCall = addFeesCall(
        getTokenAddress(token, chainId),
        token.isNativeToken,
        fee
      );
      calls.push(feeCall);

      const txHash = await sendAndWaitTransaction(calls);

      await updatePositions(
        txHash,
        multiStrategy,
        amountWithoutFee,
        chainId,
        user,
        token.name
      );

      return txHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", user] });
    },
  });

  return {
    invest,
    multiInvest,
    multiInvestWithSwap,
    redeem,
  };
}
