import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";
import { useChainId, useClient } from "wagmi";
import axios from "axios";
import { formatUnits, type Address, decodeEventLog, parseAbi } from "viem";
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
} from "./utils";
import { addFeesCall, calculateFee } from "@/utils/fee";
import { getTokenAddress, getTokenByName } from "@/utils/coins";
import { getStrategy } from "@/utils/strategies";
 
type RedeemParams = {
  strategy: BaseStrategy<Protocol>;
  amount: bigint;
  token: Token;
  positionId: string;
  liquidityParams?: {
    tokenId: bigint;
    token0: Address;
    token1: Address;
    liquidityAmount?: bigint;
    collectFees?: boolean;
    burnNFT?: boolean;
  };
};

type InvestParams = {
  strategyId: Strategy;
  amount: bigint;
  token: Token;
  strategyParams?: {
    pairToken?: Token;
    fee?: number;
    slippage?: number;
    swapSlippage?: number;
    tickLower?: number;
    tickUpper?: number;
    deadline?: number;
  };
};

type MultiInvestParams = {
  multiStrategy: MultiStrategy;
  amount: bigint;
  token: Token;
  positionId?: string;
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

  async function sendAndWaitTransaction(calls: StrategyCall[]): Promise<{
    txHash: string;
    transactionData?: {
      tokenId: bigint;
      liquidity: bigint;
      token0: Address;
      token1: Address;
      fee: number;
      amount0: bigint;
      amount1: bigint;
    };
  }> {
    async function waitForUserOp(userOp: `0x${string}`): Promise<{
      transactionHash: string;
      receipt: {
        transactionHash: string;
        status: string;
        logs: Array<{
          data: string;
          topics: string[];
        }>;
      };
    }> {
      if (!publicClient) throw new Error("Public client not available");

      const receipt = await waitForTransactionReceipt(publicClient, {
        hash: userOp,
      });

      if (receipt.status === "success") {
        return {
          transactionHash: receipt.transactionHash,
          receipt,
        };
      } else {
        throw new Error(
          `Strategy execution reverted with txHash: ${receipt.transactionHash}`
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
    
    const { transactionHash, receipt } = await waitForUserOp(userOp);
    
    // Extract transaction data for UniswapV3 mint transactions
    let transactionData: {
      tokenId: bigint;
      liquidity: bigint;
      token0: Address;
      token1: Address;
      fee: number;
      amount0: bigint;
      amount1: bigint;
    } | undefined = undefined;
    
    // Check if this is a UniswapV3 mint by looking for the NFT manager address in calls
    const nftManagerCall = calls.find(call => 
      call.data && call.data.includes('0x88316456') // mint function selector
    );
    
    if (nftManagerCall && receipt.logs) {
      try {
        transactionData = await extractUniswapV3Data(receipt, calls);
      } catch (error) {
        console.warn("Failed to extract UniswapV3 data from transaction:", error);
      }
    }
    
    return {
      txHash: transactionHash,
      transactionData,
    };
  }

  // Helper function to extract UniswapV3 mint data from transaction receipt and calls
  async function extractUniswapV3Data(receipt: {
    transactionHash: string;
    logs: Array<{
      data: string;
      topics: string[];
    }>;
  }, calls: StrategyCall[]): Promise<{
    tokenId: bigint;
    liquidity: bigint;
    token0: Address;
    token1: Address;
    fee: number;
    amount0: bigint;
    amount1: bigint;
  } | undefined> {
    if (!receipt.logs || receipt.logs.length === 0) return undefined;

    try {
      // Define the UniswapV3 NFT Manager events we need to parse
      const nftManagerAbi = parseAbi([
        'event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      ]);

      // Find the IncreaseLiquidity event
      const increaseLiquidityEvent = receipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: nftManagerAbi,
            data: log.data,
            topics: log.topics
          });
          return decoded.eventName === 'IncreaseLiquidity';
        } catch {
          return false;
        }
      });

      if (!increaseLiquidityEvent) {
        console.warn("No IncreaseLiquidity event found in transaction logs");
        return undefined;
      }

      // Decode the IncreaseLiquidity event
      const decodedEvent = decodeEventLog({
        abi: nftManagerAbi,
        data: increaseLiquidityEvent.data,
        topics: increaseLiquidityEvent.topics
      });

      const { tokenId, liquidity, amount0, amount1 } = decodedEvent.args as {
        tokenId: bigint;
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      };

      // Extract token addresses and fee from the mint call data
      const mintCall = calls.find(call => 
        call.data && call.data.includes('0x88316456') // mint function selector
      );

      if (!mintCall || !mintCall.data) {
        console.warn("No mint call found to extract token addresses");
        return undefined;
      }

      // Parse the mint call data to extract token0, token1, and fee
      // mint(address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256)
      const mintData = mintCall.data.slice(10); // Remove function selector
      const token0 = ('0x' + mintData.slice(24, 64)) as Address;
      const token1 = ('0x' + mintData.slice(88, 128)) as Address;
      const fee = parseInt(mintData.slice(128, 136), 16);

      return {
        tokenId,
        liquidity,
        token0,
        token1,
        fee,
        amount0,
        amount1
      };
    } catch (error) {
      console.error("Error extracting UniswapV3 data from transaction logs:", error);
      return undefined;
    }
  }

  const redeem = useMutation({
    mutationFn: async ({
      strategy,
      amount,
      token,
      positionId,
      liquidityParams,
    }: RedeemParams) => {
      if (!user) throw new Error("Smart wallet account not found");

      const { fee, amount: amountWithoutFee } = calculateFee(amount);
      const calls = await getRedeemCalls(
        strategy,
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

      const { txHash } = await sendAndWaitTransaction(calls);

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
    mutationFn: async ({ strategyId, amount, token, strategyParams }: InvestParams) => {
      if (!user) throw new Error("Smart wallet account not found");

      const strategy = getStrategy(strategyId, chainId);

      const { fee, amount: amountWithoutFee } = calculateFee(amount);
      const calls = await getInvestCalls(
        strategy,
        amountWithoutFee,
        user,
        token,
        chainId,
        strategyParams
      );

      const feeCall = addFeesCall(
        getTokenAddress(token, chainId),
        token.isNativeToken,
        fee
      );

      calls.push(feeCall);
      const { txHash, transactionData } = await sendAndWaitTransaction(calls);

      // Build metadata for UniswapV3 strategies
      let positionMetadata: {
        nftTokenId?: string;
        token0?: string;
        token1?: string;
        fee?: number;
        liquidityAmount?: string;
        tickLower?: number;
        tickUpper?: number;
      } | undefined;
      
      if (strategy.name === "UniswapV3AddLiquidity") {
        if (transactionData) {
          // Use real transaction data extracted from logs
          positionMetadata = {
            nftTokenId: transactionData.tokenId.toString(),
            token0: transactionData.token0,
            token1: transactionData.token1,
            fee: transactionData.fee,
            liquidityAmount: transactionData.liquidity.toString(),
            tickLower: strategyParams?.tickLower || -887220,
            tickUpper: strategyParams?.tickUpper || 887220,
          };
        } else {
          // Fallback metadata when transaction data extraction fails
          const pairToken = strategyParams?.pairToken;
          const asset = getTokenAddress(token, chainId);
          
          // Only create fallback if we have required data
          if (pairToken?.address) {
            positionMetadata = {
              nftTokenId: `fallback_${Date.now()}`, // Fallback ID
              token0: asset < pairToken.address ? asset : pairToken.address,
              token1: asset > pairToken.address ? asset : pairToken.address,
              fee: strategyParams?.fee || 3000,
              liquidityAmount: "0", // Unknown without transaction data
              tickLower: strategyParams?.tickLower || -887220,
              tickUpper: strategyParams?.tickUpper || 887220,
            };
          }
        }
      }

      await updatePosition({
        address: user,
        amount: Number(formatUnits(amountWithoutFee, token.decimals)),
        token_name: token.name,
        chain_id: chainId,
        strategy: strategy.name,
        metadata: positionMetadata,
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

      const { txHash } = await sendAndWaitTransaction(calls);

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
    redeem,
  };
}
