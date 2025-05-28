import { AnalyzePortfolioMessage, Message } from "@/classes/message";
import { PortfolioPieChart } from "@/components/RiskPortfolio/PieChart";
import { createPieChartStrategies } from "@/utils/pie";
import Button from "@/components/Button";
import { Percent, Sparkles } from "lucide-react";
import { useState } from "react";
import { Protocol, RiskLevel } from "@/types";

interface AnalyzePortfolioChatWrapperProps {
  message: AnalyzePortfolioMessage;
  addBotMessage: (message: Message) => Promise<void>;
}

// TODO: use real data
const dummyStrategies = [
  {
    title: "Strategy 1",
    allocation: 50,
    apy: 10,
    risk: {
      level: "low" as RiskLevel,
      color: "#10B981",
      bgColor: "#E2F9F3",
    },
    protocol: "UniswapV3AddLiquidity" as Protocol,
    chainId: 1,
    id: "",
    description: "",
    image: "",
    tokens: [],
  },
  {
    title: "Strategy 2",
    allocation: 50,
    apy: 10,
    risk: {
      level: "low" as RiskLevel,
      color: "#10B981",
      bgColor: "#E2F9F3",
    },
    protocol: "UniswapV3AddLiquidity" as Protocol,
    chainId: 1,
    id: "",
    description: "",
    image: "",
    tokens: [],
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
      <PortfolioPieChart
        pieStrategies={createPieChartStrategies(dummyStrategies)}
      />

      <p className="text-xs">Assets</p>
      <PortfolioPieChart
        pieStrategies={createPieChartStrategies(dummyStrategies)}
      />

      <p className="text-xs">Risk</p>
      <PortfolioPieChart
        pieStrategies={createPieChartStrategies(dummyStrategies)}
      />

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
