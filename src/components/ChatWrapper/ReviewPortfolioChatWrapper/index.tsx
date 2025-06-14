import React, { useState } from "react";

import { Message, ReviewPortfolioMessage } from "@/classes/message";
import { createPieChartStrategies } from "@/utils/pie";
import { Percent, MoveUpRight } from "lucide-react";
import { parseUnits } from "viem";
import { toast } from "react-toastify";
import axios from "axios";
import { MoonLoader } from "react-spinners";

import Button from "@/components/Button";
import { PortfolioPieChart } from "../../RiskPortfolio/PieChart";
import useCurrency from "@/hooks/useCurrency";
import { USDC } from "@/constants/coins";
import { MultiStrategy } from "@/classes/strategies/multiStrategy";
import { getStrategy } from "@/utils/strategies";
import { useStrategyExecutor } from "@/hooks/useStrategyExecutor";

interface ReviewPortfolioChatWrapperProps {
  message: ReviewPortfolioMessage;
  addBotMessage: (message: Message) => Promise<void>;
}

const ReviewPortfolioChatWrapper: React.FC<ReviewPortfolioChatWrapperProps> = ({
  message,
  addBotMessage,
}) => {
  const [isEdit, setIsEdit] = useState(true);
  const { balance, isLoadingBalance } = useCurrency(USDC);
  const { multiInvest } = useStrategyExecutor();

  const strategies = message.strategies;
  const totalAPY = strategies.reduce((acc, strategy) => {
    return acc + (strategy.apy * strategy.allocation) / 100;
  }, 0);

  const nextMessage = async (action: "build" | "edit") => {
    if (isLoadingBalance) return;
    setIsEdit(false);

    // TODO: hardcode USDC to check balance is enough
    if (action === "build") {
      if (
        parseUnits(message.amount, USDC.decimals) >
        parseUnits(balance.toString(), USDC.decimals)
      ) {
        await addBotMessage(message.next("deposit"));
      } else {
        await executeMultiStrategy();
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

    try {
      const txHash = await multiInvest.mutateAsync({
        multiStrategy,
        amount: parseUnits(message.amount, USDC.decimals),
        token: USDC,
      });
      toast.success(`Portfolio built successfully, ${txHash}`);
      await addBotMessage(message.next("build"));
    } catch (error) {
      console.error("Error building portfolio:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorData = JSON.parse(error.response.data);
        console.error("Error response data:", errorData);
        toast.error(`Error building portfolio, ${errorData.message}`);
      } else {
        toast.error(`Error building portfolio, ${error}`);
      }
    }
  }

  return (
    <div className="my-4 flex flex-col gap-6 w-full max-w-[805px]">
      <p className="text-gray">Total APY: {totalAPY.toFixed(2)}%</p>
      {/* Portfolio visualization */}
      <div className="flex items-center w-full px-[10px] gap-[10px]">
        <div className="w-full">
          <PortfolioPieChart
            pieStrategies={createPieChartStrategies(message.strategies)}
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

        {multiInvest.isPending ? (
          <button
            className="w-full cursor-pointer max-w-[250px] flex items-center justify-center gap-2.5 rounded-lg bg-[#5F79F1] text-white py-3.5 px-5 disabled:opacity-50"
            disabled={multiInvest.isPending}
          >
            <MoonLoader size={12} />
          </button>
        ) : (
          <Button
            onClick={() => nextMessage("build")}
            text="Start Building Portfolio"
            disabled={!isEdit}
            icon={<MoveUpRight />}
          />
        )}
      </div>
    </div>
  );
};

export default ReviewPortfolioChatWrapper;
