import { AnalyzePortfolioMessage } from "./analyze-portfolio";
import { Message, MessageMetadata } from "./base";
import { ReviewPortfolioMessage } from "./review-portfolio";
import { RiskPortfolioStrategies } from "@/types/strategies";

export class EditMessage extends Message {
  constructor(
    metadata: MessageMetadata,
    public readonly amount: string,
    public readonly chain: number,
    public strategies: RiskPortfolioStrategies[],
    public readonly from: "analyze" | "portfolio" = "portfolio"
  ) {
    super(metadata);
  }

  next(): Message {
    switch (this.from) {
      case "analyze":
        return new AnalyzePortfolioMessage(
          this.createDefaultMetadata("Analyze"),
          true
        );
      case "portfolio":
        return new ReviewPortfolioMessage(
          this.createDefaultMetadata("Review"),
          this.amount,
          this.chain,
          this.strategies
        );
    }
  }
}
