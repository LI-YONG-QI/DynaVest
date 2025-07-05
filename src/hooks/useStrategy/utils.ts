import axios, { AxiosResponse } from "axios";
import { Address } from "viem";

import { StrategyCall } from "@/classes/strategies/baseStrategy";
import { Protocol } from "@/types/strategies";
import { getTokenAddress } from "@/utils/coins";

import { BaseStrategy } from "@/classes/strategies/baseStrategy";
import { MultiStrategy } from "@/classes/strategies/multiStrategy";
import { Token } from "@/types/blockchain";
import {
  UniswapV3AddLiquidity,
  UniswapV3AddLiquidityParams,
  UniswapV3InvestParams,
} from "@/classes/strategies/uniswap/liquidity";

export type PositionParams = {
  address: Address;
  amount: number;
  token_name: string;
  chain_id: number;
  strategy: string;
  metadata?: Record<string, unknown>; // For strategy-specific data like NFT tokenId
};

type PositionResponse = {
  id: string;
  chain_id: number;
  amount: number;
  strategy: string;
  status: string;
};

export async function getRedeemCalls(
  strategy: BaseStrategy<Protocol> | MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number,
  runtimeParams?: {
    tokenId?: bigint;
    token0?: Address;
    token1?: Address;
    liquidityAmount?: bigint;
    collectFees?: boolean;
    burnNFT?: boolean;
  }
) {
  let calls: StrategyCall[];

  if (token.isNativeToken) {
    calls = await strategy.redeemCalls(amount, user, undefined, runtimeParams);
  } else {
    calls = await strategy.redeemCalls(
      amount,
      user,
      getTokenAddress(token, chainId),
      runtimeParams
    );
  }

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

export async function getInvestCalls(
  strategy: BaseStrategy<Protocol> | MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number,
  runtimeParams?: {
    pairToken?: Token;
    fee?: number;
    slippage?: number;
    swapSlippage?: number;
    tickLower?: number;
    tickUpper?: number;
    deadline?: number;
  }
) {
  let calls: StrategyCall[];

  if (token.isNativeToken) {
    calls = await strategy.investCalls(amount, user, undefined, runtimeParams);
  } else if (strategy instanceof UniswapV3AddLiquidity) {
    // Build UniswapV3InvestParams from runtime parameters
    const pairToken = runtimeParams?.pairToken as Token;
    if (!pairToken) {
      throw new Error("UniswapV3AddLiquidity: pairToken is required");
    }
    
    const investParams: UniswapV3InvestParams = {
      assetName: token.name,
      pairToken,
      fee: (runtimeParams?.fee as number) || undefined, // Use strategy default
      slippage: (runtimeParams?.slippage as number) || undefined, // Use strategy default
      swapSlippage: (runtimeParams?.swapSlippage as number) || undefined,
      tickLower: (runtimeParams?.tickLower as number) || undefined,
      tickUpper: (runtimeParams?.tickUpper as number) || undefined,
      deadline: (runtimeParams?.deadline as number) || undefined,
    };
    
    calls = await strategy.investCalls(
      amount,
      user,
      getTokenAddress(token, chainId),
      investParams
    );
  } else {
    calls = await strategy.investCalls(
      amount,
      user,
      getTokenAddress(token, chainId),
      runtimeParams
    );
  }

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

export async function getInvestCallsWithSwap(
  strategy: MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number,
  liquidityOptions: UniswapV3AddLiquidityParams
) {
  const calls = await strategy.investCalls(
    amount,
    user,
    getTokenAddress(token, chainId),
    liquidityOptions
  );

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

/**
 * @notice Update the position in the database, if the position doesn't exist, create a new one
 * @param positionParams - The parameters for the position
 * @returns API Axios response
 */
export async function updatePosition(positionParams: PositionParams) {
  // TODO: refactor with backend

  // Check user if have any position
  let res: AxiosResponse;
  try {
    res = await axios.get(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${positionParams.address}`
    );
  } catch {
    return await axios.post(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/position`,
      positionParams
    );
  }

  // Check user if have the same position
  const position = res.data.find(
    (pos: PositionResponse) =>
      pos.strategy === positionParams.strategy &&
      pos.status === "true" &&
      pos.chain_id === positionParams.chain_id
  );
  if (!position) {
    return await axios.post(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/position`,
      positionParams
    );
  } else {
    const newAmount = Number(position.amount) + positionParams.amount;
    return await axios.patch(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${position.position_id}`,
      {
        amount: newAmount,
      }
    );
  }
}
