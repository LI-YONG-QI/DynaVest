import type { Address } from "viem";
import { custom, http } from "@wagmi/core";

import { BaseStrategy } from "./base";
import {
  StCeloSupportedChains,
  ST_CELO_CONTRACTS,
  AAVE_CONTRACTS,
} from "../constants/protocols";
import { celo } from "viem/chains";
import { createWalletClient, createPublicClient } from "viem";
import { AAVE_V3_ABI, ERC20_ABI } from "@/app/abis";
import { cUSD } from "@/app/utils/constants/coins";

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

  /// @notice Staking CELO to stCelo
  async execute(user: Address, _asset: null, amount: bigint): Promise<string> {
    const pool = AAVE_CONTRACTS[this.chainId].pool;
    const asset = cUSD.chains![this.chainId];

    if (!window.ethereum) {
      throw new Error("No ethereum provider found. Please install a wallet.");
    }

    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celo,
    });

    const [address] = await walletClient.getAddresses();

    const tx = await walletClient.writeContract({
      address: asset,
      abi: ERC20_ABI,
      functionName: "approve",
      account: address,
      args: [pool, amount],
    });

    await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    const supplyTx = await walletClient.writeContract({
      address: pool,
      abi: AAVE_V3_ABI,
      functionName: "supply",
      account: address,
      args: [asset, amount, address, 0],
    });

    const supplyReceipt = await publicClient.waitForTransactionReceipt({
      hash: supplyTx,
    });

    return supplyReceipt.transactionHash;
  }

  isSupported(chainId: number): boolean {
    return Object.keys(ST_CELO_CONTRACTS).map(Number).includes(chainId);
  }
}
