import { waitForTransactionReceipt } from "@wagmi/core";
import { Address } from "viem";

import { wagmiConfig as config } from "@/providers/config";
export abstract class BaseStrategy<T extends number> {
  public readonly chainId: T;

  constructor(chainId: number) {
    if (!this.isSupported(chainId)) {
      throw new Error("Chain not supported");
    } else {
      this.chainId = chainId as T;
    }
  }

  /**
   * @param asset - The asset to invest in. If the strategy is for native tokens, set to null.
   */
  // TODO: asset should be optional (update all strategies class)
  abstract execute(
    user: Address,
    asset: Address | null,
    amount: bigint
  ): Promise<string | object>;

  abstract isSupported(chainId: number): boolean;

  protected async executeWaitTx(
    writeContract: () => Promise<`0x${string}`>
  ): Promise<string> {
    const hash = await writeContract();
    await waitForTransactionReceipt(config, { hash });

    return hash;
  }
}
