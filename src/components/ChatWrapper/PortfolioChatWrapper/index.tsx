import React, { useEffect, useState } from "react";
import { MoveUpRight, Percent } from "lucide-react";
import { parseUnits } from "viem";

import { RiskLevel, RiskPortfolioStrategies } from "@/types";
import type { Message, PortfolioMessage } from "@/classes/message";
import { RISK_OPTIONS } from "@/constants/risk";
import { createPieChartStrategies } from "@/utils/pie";
import { getRiskDescription } from "../../RiskPortfolio";
import { PortfolioPieChart } from "../../RiskPortfolio/PieChart";
import { RiskBadgeList } from "../../RiskBadgeList";
import Button from "@/components/Button";
import { USDC } from "@/constants/coins";
import useCurrency from "@/hooks/useCurrency";
import { getStrategy } from "@/utils/strategies";
import { MultiStrategy } from "@/classes/strategies/multiStrategy";
import { useStrategyExecutor } from "@/hooks/useStrategyExecutor";
import { toast } from "react-toastify";
import axios from "axios";

interface PortfolioChatWrapperProps {
  message: PortfolioMessage;
  addBotMessage: (message: Message) => Promise<void>;
}

const PortfolioChatWrapper: React.FC<PortfolioChatWrapperProps> = ({
  message,
  addBotMessage,
}) => {
  const [risk, setRisk] = useState<RiskLevel>(message.risk);
  const [strategies, setStrategies] = useState<RiskPortfolioStrategies[]>(
    message.strategies
  );
  const [isEdit, setIsEdit] = useState(true);
  const { balance, isLoadingBalance } = useCurrency(USDC);
  const { invest } = useStrategyExecutor();

  const nextMessage = async (action: "build" | "edit") => {
    if (isLoadingBalance) return;

    message.risk = risk;
    message.strategies = strategies;

    setIsEdit(false);

    if (action === "build") {
      if (
        parseUnits(message.amount, USDC.decimals) >
        parseUnits(balance.toString(), USDC.decimals)
      ) {
        await addBotMessage(message.next("deposit"));
      } else {
        await executeMultiStrategy();
        await addBotMessage(message.next("build"));
      }
    } else {
      await addBotMessage(message.next(action));
    }
  };

  async function executeMultiStrategy() {
    const strategiesHandlers = strategies.map((strategy) => ({
      strategy: getStrategy(strategy.protocol, strategy.chainId),
      allocation: strategy.allocation,
    }));
    const multiStrategy = new MultiStrategy(strategiesHandlers);

    invest.mutate(
      {
        strategy: multiStrategy,
        amount: parseUnits(message.amount, USDC.decimals),
        token: USDC,
      },
      {
        onSuccess: (tx) => {
          toast.success(`Portfolio built successfully, ${tx}`);
        },
        onError: (error) => {
          if (axios.isAxiosError(error) && error.response) {
            const errorData = JSON.parse(error.response.data);
            console.error("Error response data:", errorData);
            toast.error(`Error building portfolio, ${errorData.message}`);
          } else {
            toast.error(`Error building portfolio, ${error}`);
          }
        },
      }
    );
  }

  useEffect(() => {
    setStrategies(message.strategiesSet[risk]);
  }, [risk]);

  return (
    <div className="mt-4 overflow-x-auto max-w-full w-full flex justify-center">
      <div className="w-full max-w-[320px] md:max-w-none">
        <div className="flex flex-col gap-3">
          <div className="rounded-[0px_10px_10px_10px] p-4 flex flex-col gap-6">
            {/* Risk preference selection */}
            <RiskBadgeList
              selectedRisk={risk}
              isEditable={isEdit}
              setSelectedRiskLevel={setRisk}
              options={RISK_OPTIONS}
            />

            <div className="flex items-center">
              <p className="text-gray text-xs md:text-sm font-normal px-1">
                {getRiskDescription(message.risk)}
              </p>
            </div>
          </div>
        </div>

        <div className="my-4 flex flex-col gap-6 w-full max-w-[805px]">
          {/* Portfolio visualization */}
          <div className="flex items-center w-full px-[10px] gap-[10px]">
            {/* Pie chart */}
            <div className="w-full">
              <PortfolioPieChart
                pieStrategies={createPieChartStrategies(strategies)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col gap-5 md:flex-row">
            <Button
              onClick={() => nextMessage("edit")}
              text="Change Percentage"
              disabled={!isEdit}
              icon={<Percent />}
            />

            <Button
              onClick={() => nextMessage("build")}
              text="Start Building Portfolio"
              disabled={!isEdit}
              icon={<MoveUpRight />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChatWrapper;
