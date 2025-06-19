import { Message, MessageMetadata } from "./base";
import { ReviewPortfolioMessage } from "./review-portfolio";
import { RiskPortfolioStrategies } from "@/types/strategies";

export class EditMessage extends Message {
  constructor(
    metadata: MessageMetadata,
    public readonly amount: string,
    public readonly chain: number,
    public strategies: RiskPortfolioStrategies[]
  ) {
    super(metadata);
  }

  next(): Message {
    return new ReviewPortfolioMessage(
      this.createDefaultMetadata(""),
      this.amount,
      this.chain,
      this.strategies
    );
  }
}
