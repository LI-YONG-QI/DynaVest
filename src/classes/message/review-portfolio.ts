import { Message, MessageMetadata } from "./base";
import { BuildPortfolioMessage } from "./build-portfolio";
import { EditMessage } from "./edit";
import { DepositMessage } from "./deposit";
import { RiskPortfolioStrategies } from "@/types/strategies";

export class ReviewPortfolioMessage extends Message {
  constructor(
    metadata: MessageMetadata,
    public readonly amount: string,
    public readonly chain: number,
    public readonly strategies: RiskPortfolioStrategies[]
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
