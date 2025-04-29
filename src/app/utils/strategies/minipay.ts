import type { Address } from "viem";
import { custom, http } from "@wagmi/core";

import { BaseStrategy } from "./base";
import { STAKED_CELO_ABI } from "@/app/abis/stakeCelo";
import {
  StCeloSupportedChains,
  ST_CELO_CONTRACTS,
} from "../constants/protocols";
import { celo } from "viem/chains";
import { createWalletClient, createPublicClient } from "viem";

const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

export class MiniPayStrategy extends BaseStrategy<StCeloSupportedChains> {
  public manager: Address;

  constructor(chainId: number) {
    super(chainId);

    this.manager = ST_CELO_CONTRACTS[this.chainId].manager;
  }

  async execute(
    user: Address,
    _asset: Address,
    amount: bigint
  ): Promise<string> {
    if (!window.ethereum) {
      throw new Error("No ethereum provider found. Please install a wallet.");
    }

    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celo,
    });

    const [address] = await walletClient.getAddresses();

    const tx = await walletClient.writeContract({
      address: this.manager,
      abi: STAKED_CELO_ABI,
      functionName: "deposit",
      value: amount,
      account: address,
      args: [],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt.transactionHash;
  }

  isSupported(chainId: number): boolean {
    return Object.keys(ST_CELO_CONTRACTS).map(Number).includes(chainId);
  }
}
