import { KernelAccountClient } from "@zerodev/sdk";
import { Address, encodeFunctionData } from "viem";

import {
  MorphoSupportedChains,
  MORPHO_CONTRACTS,
  ERC20_ABI,
} from "@/constants";
import { BaseStrategy } from "./base";

export class MorphoAA extends BaseStrategy<MorphoSupportedChains> {
  public readonly morpho: Address;

  constructor(
    chainId: number,
    public readonly kernelAccountClient: KernelAccountClient
  ) {
    super(chainId);

    this.morpho = MORPHO_CONTRACTS[this.chainId].morpho;
  }

  async execute(
    user: Address,
    asset: Address,
    amount: bigint
  ): Promise<string> {
    const userOp = await this.kernelAccountClient.sendUserOperation({
      calls: [
        {
          to: asset,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "approve",
            args: [this.morpho, amount],
          }),
        },

        {
          to: asset,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [this.morpho, amount],
          }),
        },
      ],
    });

    console.log("userOp", userOp);

    return userOp;
  }

  isSupported(chainId: number): boolean {
    return Object.keys(MORPHO_CONTRACTS).map(Number).includes(chainId);
  }
}
