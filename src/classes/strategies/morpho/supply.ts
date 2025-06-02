import { Address, encodeFunctionData, Hex, toHex } from "viem";
import { readContract } from "@wagmi/core";

import { MORPHO_CONTRACTS, ERC20_ABI, MORPHO_ABI } from "@/constants";
import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { wagmiConfig as config } from "@/providers/config";

export class MorphoSupply extends BaseStrategy<typeof MORPHO_CONTRACTS> {
  constructor(chainId: number) {
    super(chainId, MORPHO_CONTRACTS, {
      name: "MorphoSupply",
      type: "Lending",
      protocol: "Morpho",
      description: "Lend assets to Morpho",
    });
  }

  async buildCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset)
      throw new Error("MorphoSupply: doesn't support native token yet");

    const morpho = this.getAddress("morpho");
    const wethUsdcMarket =
      "0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda"; // TODO: mock market id
    const marketParams = await this.#getMarketParams(wethUsdcMarket);

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
