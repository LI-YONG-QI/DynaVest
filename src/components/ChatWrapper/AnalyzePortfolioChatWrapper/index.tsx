import { AnalyzePortfolioMessage, Message } from "@/classes/message";
import { PortfolioPieChart } from "@/components/RiskPortfolio/PieChart";
import Button from "@/components/Button";
import { Percent, Sparkles, MoveUpRight } from "lucide-react";
import { useState } from "react";
import { COLORS } from "@/utils/pie";

interface AnalyzePortfolioChatWrapperProps {
  message: AnalyzePortfolioMessage;
  addBotMessage: (message: Message) => Promise<void>;
  canBuildPortfolio?: boolean;
}

const AnalyzePortfolioChatWrapper: React.FC<
  AnalyzePortfolioChatWrapperProps
> = ({ message, addBotMessage, canBuildPortfolio = false }) => {
  const [isEdit, setIsEdit] = useState(true);

  const nextMessage = async (
    action: "positions" | "assets" | "risk" | "rebalance" | "build"
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
        pieStrategies={message.strategies.map((strategy, index) => ({
          id: index,
          color: COLORS[index],
          name: strategy.title,
          apy: strategy.apy,
          risk: strategy.risk.level, // Only pass the risk level string
          allocation: strategy.allocation,
        }))}
      />

      <p className="text-xs">Assets</p>
      <PortfolioPieChart
        pieStrategies={message.assets.map((asset, index) => ({
          id: index,
          color: asset.color,
          name: asset.name,
          allocation: asset.allocation,
        }))}
      />

      <p className="text-xs">Risk</p>
      <PortfolioPieChart
        pieStrategies={message.risks.map((risk, index) => ({
          id: index,
          color: risk.color,
          name: risk.name,
          allocation: risk.allocation,
        }))}
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
        {canBuildPortfolio ? (
          <Button
            onClick={() => nextMessage("build")}
            text="Start Building Portfolio"
            disabled={!isEdit}
            icon={<MoveUpRight />}
          />
        ) : (
          <Button
            onClick={() => nextMessage("rebalance")}
            text="Smart Relancing"
            disabled={!isEdit}
            icon={<Sparkles />}
          />
        )}
      </div>
    </div>
  );
};

export default AnalyzePortfolioChatWrapper;
