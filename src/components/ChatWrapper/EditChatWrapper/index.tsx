import React, { useState } from "react";
import type {
  StrategyPortfolioItem,
  AssetPortfolioItem,
  RiskPortfolioItem,
} from "@/types/portfolio";
import type { Protocol, RiskPortfolioStrategies } from "@/types/strategies";
import ChangePercentList from "../../ChangePercentList";
import { EditMessage } from "@/classes/message";
import { Message } from "@/classes/message";

type PortfolioItem =
  | StrategyPortfolioItem
  | AssetPortfolioItem
  | RiskPortfolioItem;

interface EditChatWrapperProps {
  message: EditMessage;
  addBotMessage: (message: Message) => Promise<void>;
}

const convertToPortfolioItem = (
  strategy: RiskPortfolioStrategies
): StrategyPortfolioItem => ({
  id: strategy.id,
  type: "strategies",
  name: strategy.title,
  allocation: strategy.allocation,
  apy: strategy.apy,
  risk: strategy.risk,
  protocol: strategy.protocol as Protocol,
  description: strategy.description || "",
  chainId: strategy.chainId,
  tokens: strategy.tokens || [],
  color: "#000000",
  externalLink: strategy.externalLink,
});

const convertToRiskPortfolioStrategies = (
  item: StrategyPortfolioItem
): RiskPortfolioStrategies => ({
  id: item.id,
  title: item.name,
  allocation: item.allocation,
  apy: item.apy,
  risk: item.risk,
  protocol: item.protocol as Protocol,
  description: item.description,
  chainId: item.chainId,
  tokens: item.tokens,
  externalLink: item.externalLink,
  image: "", // Default empty image, should be provided by the backend
});

const EditChatWrapper: React.FC<EditChatWrapperProps> = ({
  message,
  addBotMessage,
}) => {
  // TODO: load items
  const [items, setItems] = useState<PortfolioItem[]>(
    message.type === "strategies"
      ? message.strategies.map(convertToPortfolioItem)
      : message.type === "assets"
      ? message.assets
      : message.type === "risks"
      ? message.risks
      : []
  );
  const [isEdit, setIsEdit] = useState(true);

  const handleItemsChange = (updatedItems: PortfolioItem[]) => {
    setItems(updatedItems);
  };

  const nextMessage = async () => {
    // Update the original message strategies if the type is 'strategies'
    if (message.type === "strategies") {
      message.strategies = (items as StrategyPortfolioItem[]).map(
        convertToRiskPortfolioStrategies
      );
    }
    if (message.type === "assets") {
      message.assets = items as AssetPortfolioItem[];
    }
    if (message.type === "risks") {
      message.risks = items as RiskPortfolioItem[];
    }
    setIsEdit(false);
    await addBotMessage(message.next());
  };

  return (
    <div className="overflow-x-auto max-w-full">
      <ChangePercentList
        items={items}
        isEditable={isEdit}
        onItemsChange={handleItemsChange}
        nextStep={nextMessage}
      />
    </div>
  );
};

export default EditChatWrapper;
