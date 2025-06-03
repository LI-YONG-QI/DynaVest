import { Address, encodeFunctionData } from "viem";

import { BaseStrategy, StrategyCall } from "../baseStrategy";
import { CAMELOT_CONTRACTS } from "@/constants/protocols";
import { XGRAIL_ABI, CAMELOT_STRATEGY_ABI } from "@/constants/abis";
import { GRAIL, WETH, xGRAIL } from "@/constants/coins";

export class CamelotStaking extends BaseStrategy<typeof CAMELOT_CONTRACTS> {
  constructor(chainId: number) {
    super(chainId, CAMELOT_CONTRACTS, {
      name: "Camelot Staking",
      type: "Staking",
      protocol: "Camelot",
      description: "Stake assets on Camelot",
    });
  }

  async buildCalls(
    amount: bigint,
    user: Address,
    asset?: Address
  ): Promise<StrategyCall[]> {
    if (!asset) {
      const grail = GRAIL.chains![this.chainId as keyof typeof GRAIL.chains];
      const xGrail = xGRAIL.chains![this.chainId as keyof typeof xGRAIL.chains];
      const weth = WETH.chains![this.chainId as keyof typeof WETH.chains];

      const pair = "0xf82105aA473560CfBF8Cbc6Fd83dB14Eb4028117"; // TODO: hardcode
      const adapter = "0x610934febc44be225adecd888eaf7dff3b0bc050"; // TODO: hardcode
      const camelotStrategy = this.getAddress("camelotStrategy");
      const dividendsV2 = this.getAddress("dividendsV2");

      // Get xGRAIL balance after swapping
      // Note: This is an approximation since we can't actually execute the swap here
      // The actual implementation may need a two-step process:
      // 1. Swap ETH to xGrail
      // 2. Then approve and allocate in a separate transaction
      const calls: StrategyCall[] = [
        {
          to: camelotStrategy,
          value: amount,
          data: encodeFunctionData({
            abi: CAMELOT_STRATEGY_ABI,
            functionName: "swapETHToXGrail",
            args: [
              {
                amountIn: amount,
                amountOut: BigInt(0),
                path: [weth, grail],
                adapters: [adapter],
                recipients: [pair],
              },
              user,
            ],
          }),
        },
        // These next steps would typically happen after the balance is known,
        // but for the sake of this refactoring we're including them all in one array
        {
          to: xGrail,
          data: encodeFunctionData({
            abi: XGRAIL_ABI,
            functionName: "approveUsage",
            args: [dividendsV2, amount], // Using input amount as a placeholder
          }),
        },
        {
          to: xGrail,
          data: encodeFunctionData({
            abi: XGRAIL_ABI,
            functionName: "allocate",
            args: [dividendsV2, amount, "0x"], // Using input amount as a placeholder
          }),
        },
      ];

      return calls;
    } else {
      throw new Error("CamelotStaking: ERC20 doesn't support yet");
    }
  }
}
