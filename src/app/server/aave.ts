import { AaveSupportedChains } from "../utils/constants/protocols/aave";
import { BaseStrategy } from "./base";
import { Address, encodeFunctionData, Hex, parseSignature } from "viem";
import { AAVE_CONTRACTS } from "../utils/constants/protocols/aave";
import type { Call } from "./types";
import { AAVE_V3_ABI } from "../abis";
import { ERC20_ABI, ERC20_PERMIT_ABI } from "../abis";

export class AaveV3Strategy extends BaseStrategy<AaveSupportedChains> {
  private readonly pool: Address;

  constructor(chainId: AaveSupportedChains) {
    super(chainId);

    this.pool = AAVE_CONTRACTS[chainId].pool;
  }

  async buildCalls(
    user: Address,
    asset: Address,
    amount: bigint,
    deadline: bigint,
    signature: Hex
  ) {
    const calls: Call[] = [];

    const { r, s, v } = parseSignature(signature);

    //* Step 1 Permit
    {
      const data = encodeFunctionData({
        abi: ERC20_PERMIT_ABI,
        functionName: "permit",
        args: [user, this.executor, amount, deadline, Number(v), r, s],
      });
      calls.push({
        target: asset,
        callData: data,
      });
    }

    //* Step 2  Transfer asset to Executor
    {
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transferFrom",
        args: [user, this.executor, amount],
      });
      calls.push({
        target: asset,
        callData: data,
      });
    }

    //* Step 3 Approve to morpho blue
    {
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [this.pool, amount],
      });
      calls.push({
        target: asset,
        callData: data,
      });
    }

    //* Step 4  Supply USDC to morpho blue
    const data = encodeFunctionData({
      abi: AAVE_V3_ABI,
      functionName: "supply",
      args: [asset, amount, user, 0],
    });

    calls.push({
      target: this.pool,
      callData: data,
    });

    return calls;
  }
}
