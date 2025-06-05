/* eslint-disable */

import { Address, encodeFunctionData } from "viem";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { UNISWAP_CONTRACTS } from "@/constants/protocols/uniswap";
import { ERC20_ABI, NFT_MANAGER_ABI } from "@/constants/abis";
import { USDT } from "@/constants/coins";
import { getDeadline } from "@/utils/strategies";

/**
 * Compares two addresses lexicographically
 * @param addressA First address
 * @param addressB Second address
 * @returns negative if addressA < addressB, positive if addressA > addressB, 0 if equal
 */
export function compareAddresses(addressA: Address, addressB: Address): number {
  // Convert to lowercase to ensure consistent comparison
  const a = addressA.toLowerCase();
  const b = addressB.toLowerCase();

  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Returns addresses sorted in ascending order
 * @param addressA First address
 * @param addressB Second address
 * @returns [smallerAddress, largerAddress]
 */
export function sortAddresses(
  addressA: Address,
  addressB: Address
): [Address, Address] {
  return compareAddresses(addressA, addressB) < 0
    ? [addressA, addressB]
    : [addressB, addressA];
}

export class UniswapV3AddLiquidity extends BaseStrategy<
  typeof UNISWAP_CONTRACTS
> {
  constructor(chainId: number) {
    super(chainId, UNISWAP_CONTRACTS, {
      name: "Uniswap V3 Add Liquidity",
      type: "Yield",
      protocol: "Uniswap V3",
      description: "Add liquidity to Uniswap V3 pools",
    });
  }

  // TODO: only support USDC/USDT, and user must have both
  async buildCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset) {
      throw new Error("UniswapV3AddLiquidity: asset is required");
    }

    const nftManager = this.getAddress("nftManager");
    const deadline = getDeadline();

    const usdt = USDT.chains![this.chainId as keyof typeof USDT.chains];
    const [token0, token1] = sortAddresses(asset, usdt);

    return [
      {
        to: token0,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [nftManager, amount],
        }),
      },
      {
        to: token1,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [nftManager, amount * BigInt(2)],
        }),
      },
      {
        to: nftManager,
        data: encodeFunctionData({
          abi: NFT_MANAGER_ABI,
          functionName: "mint",
          args: [
            {
              token0,
              token1,
              fee: 100,
              tickLower: -887220,
              tickUpper: 887220,
              amount0Desired: amount,
              amount1Desired: amount * BigInt(2), // TODO: calculate the valid amount of token1
              amount0Min: BigInt(0), // TODO: add min amount
              amount1Min: BigInt(0), // TODO: add min amount
              recipient: user,
              deadline,
            },
          ],
        }),
      },
    ];
  }
}
