import { RiskLevel, RiskPortfolioStrategies } from "@/types";
import { Message, MessageMetadata } from "./base";
import { EditMessage } from "./edit";
import { BuildPortfolioMessage } from "./build-portfolio";
import { generateMockAssets, generateMockRisks } from "@/types/portfolio";
import { STRATEGIES_METADATA } from "@/constants";
import { AssetPortfolioItem, RiskPortfolioItem } from "@/types/portfolio";

export class AnalyzePortfolioMessage extends Message {
  public risk: RiskLevel = "low";

  constructor(
    metadata: MessageMetadata,
    public readonly strategies: RiskPortfolioStrategies[] = STRATEGIES_METADATA.slice(
      0,
      5
    ).map((strategy) => ({
      ...strategy,
      allocation: 20,
    })),
    public readonly assets: AssetPortfolioItem[] = generateMockAssets(),
    public readonly risks: RiskPortfolioItem[] = generateMockRisks(),
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
          "analyze",
          "strategies",
          this.assets,
          this.risks
        );
      case "assets":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          "",
          0,
          this.strategies,
          "analyze",
          "assets",
          this.assets,
          this.risks
        );
      case "risk":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          "",
          0,
          this.strategies,
          "analyze",
          "risks",
          this.assets,
          this.risks
        );
      case "rebalance":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          "",
          0,
          this.strategies,
          "analyze",
          "strategies",
          this.assets,
          this.risks
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
