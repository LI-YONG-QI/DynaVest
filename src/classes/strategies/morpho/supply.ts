import { Address, encodeFunctionData, Hex, toHex } from "viem";
import { readContract } from "@wagmi/core";

import { MORPHO_CONTRACTS, ERC20_ABI, MORPHO_ABI } from "@/constants";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { wagmiConfig as config } from "@/providers/config";

/**
 * @notice MorphoSupply is a strategy that allows users to supply their assets to Morpho
 * @notice It supports only USDC (loanToken) and WETH (collateralToken) market
 */
export class MorphoSupply extends BaseStrategy<typeof MORPHO_CONTRACTS> {
  private readonly WETH_USDC_MARKET_ID =
    "0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda";

  constructor(chainId: number) {
    super(chainId, MORPHO_CONTRACTS, "MorphoSupply");
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

  async redeemCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
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

  async getProfit(data: {
    user: Address;
    amount: number;
    asset: Address;
  }): Promise<number> {
    const { amount } = data;
    return amount * 4.75;
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
