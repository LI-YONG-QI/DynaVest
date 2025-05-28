import { RiskLevel, RiskPortfolioStrategies } from "@/types";
import { Message, MessageMetadata } from "./base";
import { EditMessage } from "./edit";
import { BuildPortfolioMessage } from "./build-portfolio";

export class AnalyzePortfolioMessage extends Message {
  public strategies: RiskPortfolioStrategies[] = [];
  public risk: RiskLevel = "low";

  constructor(
    metadata: MessageMetadata,
    public readonly canBuildPortfolio: boolean = false
  ) {
    super(metadata);
  }

  next(
    action: "positions" | "assets" | "risk" | "rebalance" | "build"
  ): Message {
    switch (action) {
      case "positions":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          "",
          0,
          this.strategies,
          "analyze"
        );
      case "assets":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          "",
          0,
          this.strategies,
          "analyze"
        );
      case "risk":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          "",
          0,
          this.strategies,
          "analyze"
        );
      case "rebalance":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          "",
          0,
          this.strategies,
          "analyze"
        );
      case "build":
        return new BuildPortfolioMessage(
          this.createDefaultMetadata("Build"),
          "",
          this.strategies
        );
    }
  }

  execute(): void {
    console.log("Portfolio analyzed successfully");
  }
}
