"use client";

import React, { useState } from "react";
import { PortfolioPieChart } from "./pie";

interface RiskPortfolioProps {
  changePercentage: () => void;
}

// Component for risk preference badges
const RiskBadge = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`rounded-lg px-3 py-3 cursor-pointer ${
        isSelected
          ? "bg-[#5F79F1] text-white"
          : "border border-[#5F79F1] text-[#5F79F1]"
      }`}
      onClick={onClick}
    >
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

// Portfolio legend item component

const RiskPortfolio = ({ changePercentage }: RiskPortfolioProps) => {
  // State for selected risk preference
  const [selectedRisk, setSelectedRisk] = useState("Balanced Risk");

  // Mock data for portfolio strategies

  // Risk preference options
  const riskOptions = [
    "Balanced Risk",
    "Low Risk",
    "Medium Risk",
    "High Risk",
    "High Airdrop Potential",
  ];

  return (
    <div className="my-4 flex flex-col gap-6 w-full max-w-[805px]">
      {/* System message with risk preferences */}
      <div className="flex flex-col gap-3">
        <div className="rounded-[0px_10px_10px_10px] p-ˋ flex flex-col gap-6">
          {/* Risk preference selection */}
          <div className="flex flex-wrap gap-[18px] items-center md:justify-start">
            {riskOptions.map((risk) => (
              <RiskBadge
                key={risk}
                label={risk}
                isSelected={selectedRisk === risk}
                onClick={() => setSelectedRisk(risk)}
              />
            ))}
          </div>

          <div className="flex items-center">
            <p className="text-gray text-sm font-normal">
              This portfolio will diversify equally in yield protocols of three
              risk levels.
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio visualization */}
      <div className="flex items-center w-full px-[10px] gap-[10px]">
        {/* Pie chart */}
        <div className="w-full">
          <PortfolioPieChart />
        </div>

        {/* Legends */}
      </div>

      {/* Action buttons */}
      <div className="w-full flex flex-col gap-5 md:flex-row">
        <button className="flex items-center justify-center gap-2.5 rounded-lg bg-[#5F79F1] text-white py-3.5 px-5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 19L16 12L9 5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-semibold">
            Start Building Portfolio
          </span>
        </button>

        <button
          className="flex items-center justify-center gap-2.5 rounded-lg bg-[#5F79F1] text-white py-3.5 px-5"
          onClick={changePercentage}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 12H8M12 16V8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-semibold">Change Percentage</span>
        </button>
      </div>
    </div>
  );
};

export default RiskPortfolio;
