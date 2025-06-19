"use client";

import React from "react";

import { PortfolioPieChart } from "./PieChart";
import type { RiskPortfolioStrategies, RiskLevel } from "@/types/strategies";
import { createPieChartStrategies } from "@/utils/pie";

interface RiskPortfolioProps {
  buildPortfolio: () => void;
  changePercent: () => void;
  riskPortfolioStrategies: RiskPortfolioStrategies[];
}

export const RiskBadge = ({
  label,
  isSelected,
  setSelectedRiskLevel,
  isEditable,
}: {
  label: string;
  isSelected: boolean;
  setSelectedRiskLevel: (risk: RiskLevel) => void;
  isEditable: boolean;
}) => {
  const handleClick = () => {
    if (isEditable) setSelectedRiskLevel(label as RiskLevel);
  };

  return (
    <div
      className={`rounded-lg px-3 py-3 cursor-pointer ${
        isSelected
          ? "bg-[#5F79F1] text-white"
          : "border border-[#5F79F1] text-[#5F79F1]"
      }`}
      onClick={handleClick}
    >
      <span className="text-sm font-medium capitalize">{label}</span>
    </div>
  );
};

export const getRiskDescription = (selectedRisk: RiskLevel) => {
  switch (selectedRisk) {
    case "low":
      return "This portfolio focuses on lower-risk yield protocols prioritizing capital preservation.";
    case "medium":
      return "This portfolio balances moderate risk with potentially higher returns.";
    case "high":
      return "This portfolio focuses on high-risk, high-reward yield protocols.";
    // case "High Airdrop Potential":
    //   return "This portfolio prioritizes protocols with potential future token airdrops.";
    default:
      return "This portfolio will diversify equally in yield protocols of three risk levels.";
  }
};

// Portfolio legend item component

const RiskPortfolio = ({ riskPortfolioStrategies }: RiskPortfolioProps) => {
  return (
    <div className="my-4 flex flex-col gap-6 w-full max-w-[805px]">
      {/* Portfolio visualization */}
      <div className="flex items-center w-full px-[10px] gap-[10px]">
        {/* Pie chart */}
        <div className="w-full">
          <PortfolioPieChart
            pieStrategies={createPieChartStrategies(riskPortfolioStrategies)}
          />
        </div>
      </div>
    </div>
  );
};

export default RiskPortfolio;
