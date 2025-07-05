import { NextRequest, NextResponse } from "next/server";

import {
  AlphaRouter,
  SwapOptionsSwapRouter02,
  SwapType,
} from "@uniswap/smart-order-router";
import {
  TradeType,
  Percent,
  Token as UniswapToken,
  CurrencyAmount,
} from "@uniswap/sdk-core";
import { getTokenAddress, getTokenByName } from "@/utils/coins";
import { Token } from "@/types";
import { ethers } from "ethers";

const wrapToUniswapToken = (token: Token, chainId: number) => {
  const address = getTokenAddress(token, chainId);

  return new UniswapToken(chainId, address, token.decimals, "MOCK", token.name);
};

export async function GET(request: NextRequest) {
  const provider = new ethers.providers.JsonRpcProvider({
    url: "https://base-mainnet.g.alchemy.com/v2/TgaFF2AJrINpF2FnXWmjwxOesUjiw2tj",
    skipFetchSetup: true,
  });

  const { searchParams } = new URL(request.url);
  const tokenInName = searchParams.get("tokenIn");
  const tokenOutName = searchParams.get("tokenOut");
  const chainId = Number(searchParams.get("chainId"));
  const recipient = searchParams.get("recipient");
  const slippage = Number(searchParams.get("slippage"));
  const amountIn = searchParams.get("amountIn");

  if (!tokenInName || !tokenOutName || !recipient || !slippage || !amountIn) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const router = new AlphaRouter({
    chainId,
    provider,
  });

  const tokenIn = wrapToUniswapToken(getTokenByName(tokenInName), chainId);
  const tokenOut = wrapToUniswapToken(getTokenByName(tokenOutName), chainId);

  const options: SwapOptionsSwapRouter02 = {
    recipient,
    slippageTolerance: new Percent(slippage, 10_000),
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };

  const route = await router.route(
    CurrencyAmount.fromRawAmount(tokenIn, amountIn),
    tokenOut,
    TradeType.EXACT_INPUT,
    options
  );

  return NextResponse.json({ route });
}
