import { Message, MessageMetadata } from "./base";
import { PortfolioMessage } from "./portfolio";
import { BuildPortfolioMessage } from "./build-portfolio";
import { RiskPortfolioStrategies } from "@/types/strategies";
import { MOCK_STRATEGIES_SET } from "@/test/constants/strategiesSet";

export class DepositMessage extends Message {
  constructor(
    metadata: MessageMetadata,
    public amount: string,
    public readonly chain: number,
    public strategies: RiskPortfolioStrategies[]
  ) {
    super(metadata);
  }

  next(action: "build" | "portfolio"): Message {
    switch (action) {
      case "portfolio":
        return new PortfolioMessage(
          this.createDefaultMetadata(`Portfolio: ${this.amount} USDC`),
          this.amount,
          this.chain,
          MOCK_STRATEGIES_SET
        );
      case "build":
        return new BuildPortfolioMessage(
          this.createDefaultMetadata(""),
          this.amount,
          this.strategies
        );
    }
  }

  execute(): void {
    console.log("Deposit executed successfully");
  }
}
