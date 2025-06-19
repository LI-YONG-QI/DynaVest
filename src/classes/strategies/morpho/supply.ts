import { Address, encodeFunctionData, Hex, toHex } from "viem";
import { readContract } from "@wagmi/core";

import { MORPHO, ERC20_ABI, MORPHO_ABI } from "@/constants";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { Position } from "@/types/position";
import { wagmiConfig as config } from "@/providers/config";
import { GetProtocolChains } from "@/types/strategies";

/**
 * @notice MorphoSupply is a strategy that allows users to supply their assets to Morpho
 * @notice It supports only USDC (loanToken) and WETH (collateralToken) market
 */
export class MorphoSupply extends BaseStrategy<typeof MORPHO> {
  private readonly WETH_USDC_MARKET_ID =
    "0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda";

  constructor(chainId: GetProtocolChains<typeof MORPHO>) {
    super(chainId, MORPHO, "MorphoSupply");
  }

  async investCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset)
      throw new Error("MorphoSupply: doesn't support native token yet");

    const morpho = this.getAddress("morpho");
    const marketParams = await this.#getMarketParams(this.WETH_USDC_MARKET_ID);

    return [
      {
        to: asset,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [morpho, amount],
        }),
      },
      {
        to: morpho,
        data: encodeFunctionData({
          abi: MORPHO_ABI,
          functionName: "supply",
          args: [marketParams, amount, BigInt(0), user, toHex("")],
        }),
      },
    ];
  }

  async redeemCalls(amount: bigint, user: Address): Promise<StrategyCall[]> {
    const morpho = this.getAddress("morpho");
    const marketParams = await this.#getMarketParams(this.WETH_USDC_MARKET_ID);

    return [
      {
        to: morpho,
        data: encodeFunctionData({
          abi: MORPHO_ABI,
          functionName: "withdraw",
          args: [marketParams, amount, BigInt(0), user, user],
        }),
      },
    ];
  }

  async getProfit(user: Address, position: Position): Promise<number> {
    const { createAt } = position;

    const now = new Date();
    const createdAt = new Date(createAt);
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate profit using APY 4.5%
    const APY = 0.045; // 4.5%
    const dailyRate = APY / 365;
    const profit = position.amount * dailyRate * diffDays;

    return profit;
  }

  async #getMarketParams(marketId: Hex) {
    const morpho = this.getAddress("morpho");

    const [loanToken, collateralToken, oracle, irm, lltv] = await readContract(
      config,
      {
        chainId: this.chainId,
        abi: MORPHO_ABI,
        address: morpho,
        functionName: "idToMarketParams",
        args: [marketId],
      }
    );

    return {
      loanToken,
      collateralToken,
      oracle,
      irm,
      lltv,
    };
  }
}
