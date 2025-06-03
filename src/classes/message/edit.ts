import { AnalyzePortfolioMessage } from "./analyze-portfolio";
import { Message, MessageMetadata } from "./base";
import { ReviewPortfolioMessage } from "./review-portfolio";
import { AssetPortfolioItem, RiskPortfolioItem } from "@/types/portfolio";
import { RiskPortfolioStrategies } from "@/types/strategies";

export class EditMessage extends Message {
  constructor(
    metadata: MessageMetadata,
    public readonly amount: string,
    public readonly chain: number,
    public strategies: RiskPortfolioStrategies[],
    public readonly from: "analyze" | "portfolio" = "portfolio",
    public readonly type: "strategies" | "assets" | "risks" = "strategies",
    public assets: AssetPortfolioItem[] = [],
    public risks: RiskPortfolioItem[] = []
  ) {
    super(metadata);
  }

  next(): Message {
    switch (this.from) {
      case "analyze":
        return new AnalyzePortfolioMessage(
          this.createDefaultMetadata("Analyze"),
          this.strategies,
          this.assets,
          this.risks,
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
