import { Message, MessageMetadata } from "./base";
import { BuildPortfolioMessage } from "./build-portfolio";
import { EditMessage } from "./edit";
import { DepositMessage } from "./deposit";
import { RiskLevel, RiskPortfolioStrategies, StrategiesSet } from "@/types";

export class PortfolioMessage extends Message {
  public strategies: RiskPortfolioStrategies[] = [];
  public risk: RiskLevel = "low";

  constructor(
    metadata: MessageMetadata,
    public readonly amount: string,
    public readonly chain: number,
    public readonly strategiesSet: StrategiesSet
  ) {
    super(metadata);
  }

  next(action: "build" | "edit" | "deposit"): Message {
    switch (action) {
      case "build":
        return new BuildPortfolioMessage(
          this.createDefaultMetadata(""),
          this.amount,
          this.strategies
        );
      case "edit":
        return new EditMessage(
          this.createDefaultMetadata("Edit"),
          this.amount,
          this.chain,
          this.strategies
        );
      case "deposit":
        return new DepositMessage(
          this.createDefaultMetadata("Deposit"),
          this.amount,
          this.chain,
          this.strategies
        );
    }
  }
}
