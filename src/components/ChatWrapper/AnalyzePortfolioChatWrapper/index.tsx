import { AnalyzePortfolioMessage, Message } from "@/classes/message";
import { PortfolioPieChart } from "@/components/RiskPortfolio/PieChart";
import Button from "@/components/Button";
import { Percent, Sparkles } from "lucide-react";
import { useState } from "react";

interface AnalyzePortfolioChatWrapperProps {
  message: AnalyzePortfolioMessage;
  addBotMessage: (message: Message) => Promise<void>;
}

// TODO: use real data
const mockPositions = [
  {
    id: 1,
    color: "#10B981",
    name: "Strategy 1",
    apy: `APY ${10}%`,
    risk: `Low Risk`,
    allocation: 50,
  },
  {
    id: 2,
    color: "#10B981",
    name: "Strategy 2",
    apy: `APY ${10}%`,
    risk: `Low Risk`,
    allocation: 50,
  },
];

const mockAssets = [
  {
    id: 1,
    color: "#10B981",
    name: "USDC",
    apy: `APY ${10}%`,
    risk: `Low Risk`,
    allocation: 50,
  },
  {
    id: 2,
    color: "#10B981",
    name: "ETH",
    apy: `APY ${10}%`,
    risk: `Low Risk`,
    allocation: 50,
  },
];

const mockRisks = [
  {
    id: 1,
    color: "#10B981",
    name: "Low Risk",
    allocation: 20,
  },
  {
    id: 2,
    color: "#B9AB15",
    name: "Medium Risk",
    allocation: 60,
  },
  {
    id: 3,
    color: "#E83033",
    name: "High Risk",
    allocation: 20,
  },
];

const AnalyzePortfolioChatWrapper: React.FC<
  AnalyzePortfolioChatWrapperProps
> = ({ message, addBotMessage }) => {
  const [isEdit, setIsEdit] = useState(true);

  const nextMessage = async (
    action: "positions" | "assets" | "risk" | "rebalance"
  ) => {
    setIsEdit(false);

    await addBotMessage(message.next(action));
  };

  return (
    <div>
      <p className="text-xs">
        Here’s an analysis of your assets and positions:
      </p>
      {/* Pie charts */}
      <p className="text-xs">Positions</p>
      <PortfolioPieChart pieStrategies={mockPositions} />

      <p className="text-xs">Assets</p>
      <PortfolioPieChart pieStrategies={mockAssets} />

      <p className="text-xs">Risk</p>
      <PortfolioPieChart pieStrategies={mockRisks} />

      {/* Action buttons */}
      <div className="flex flex-row items-center gap-2 text-xs whitespace-nowrap">
        <Button
          onClick={() => nextMessage("positions")}
          text="Adjust Position"
          disabled={!isEdit}
          icon={<Percent />}
        />
        <Button
          onClick={() => nextMessage("assets")}
          text="Adjust Assets"
          disabled={!isEdit}
          icon={<Percent />}
        />
        <Button
          onClick={() => nextMessage("risk")}
          text="Adjust Risk"
          disabled={!isEdit}
          icon={<Percent />}
        />
      </div>
      <div className="w-full my-3">
        <Button
          onClick={() => nextMessage("rebalance")}
          text="Smart Relancing"
          disabled={!isEdit}
          icon={<Sparkles />}
        />
      </div>
    </div>
  );
};

export default AnalyzePortfolioChatWrapper;
