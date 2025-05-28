import { Message, MessageMetadata } from "./base";
import { TextMessage } from "./text";

export class AnalyzePortfolioMessage extends Message {
  constructor(metadata: MessageMetadata) {
    super(metadata);
  }

  next(action: "positions" | "assets" | "risk" | "rebalance"): Message {
    switch (action) {
      case "positions":
        return new TextMessage(this.metadata);
      case "assets":
        return new TextMessage(this.metadata);
      case "risk":
        return new TextMessage(this.metadata);
      case "rebalance":
        return new TextMessage(this.metadata);
    }
  }

  execute(): void {
    console.log("Portfolio analyzed successfully");
  }
}
