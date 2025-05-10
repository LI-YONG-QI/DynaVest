import { Address, Hex } from "viem";
import { signTypedData } from "@wagmi/core";
import { readContract } from "@wagmi/core";

import { ERC20_PERMIT_ABI } from "@/constants/abis";
import { PERMIT_TYPES } from "@/types/blockchain";
import { BaseStrategy } from "./base";
import { PERMIT_EXPIRY } from "@/constants";
import {
  MORPHO_CONTRACTS,
  MorphoSupportedChains,
} from "@/constants/protocols/morpho";
import { wagmiConfig as config } from "@/providers/config";
import { DYNAVEST_CONTRACTS } from "@/constants/protocols/dynaVest";

export interface MorphoParams {
  chainId: number;
  user: Address;
  asset: Address;
  amount: string;
  deadline: string;
  signature: Hex;
}

export class MorphoSupplyingStrategy extends BaseStrategy<MorphoSupportedChains> {
  public readonly morpho: Address;
  public readonly executor: Address;

  constructor(chainId: number) {
    super(chainId);

    this.morpho = MORPHO_CONTRACTS[this.chainId].morpho;
    this.executor = DYNAVEST_CONTRACTS[this.chainId].executor;
  }

  async execute(
    user: Address,
    asset: Address,
    amount: bigint
  ): Promise<string> {
    const timestampInSeconds = Math.floor(Date.now() / 1000);
    const deadline = BigInt(timestampInSeconds) + BigInt(PERMIT_EXPIRY);

    const nonce = await readContract(config, {
      abi: ERC20_PERMIT_ABI,
      address: asset,
      functionName: "nonces",
      args: [user!],
    });

    // TODO: only USDC is supported (solution: Permit2)
    const signature = await signTypedData(config, {
      domain: {
        name: "USD Coin",
        chainId: this.chainId,
        verifyingContract: asset,
        version: "2",
      },
      types: PERMIT_TYPES,
      primaryType: "Permit",
      message: {
        owner: user,
        spender: this.executor,
        value: amount,
        nonce: nonce!,
        deadline,
      },
    });

    const body: MorphoParams = {
      chainId: this.chainId,
      user,
      asset,
      amount: amount.toString(),
      deadline: deadline.toString(),
      signature,
    };

    const response = await fetch("/api/morpho", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const result = await response.json();

    return result.message;
  }

  isSupported(chainId: number): boolean {
    return Object.keys(MORPHO_CONTRACTS).map(Number).includes(chainId);
  }
}
