"use client";

import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";

import { Card, CardContent } from "@/app/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart";

// TODO: sync with chartData and chartConfig
const strategies = [
  {
    id: 1,
    color: "#7086FD",
    name: "GMX Strategy",
    apy: "APY 214.47%",
    risk: "High Risk",
  },
  {
    id: 2,
    color: "#6FD195",
    name: "AAVE Lending",
    apy: "APY 214.47%",
    risk: "High Risk",
  },
  {
    id: 3,
    color: "#FFAE4C",
    name: "Uniswap Liquidity",
    apy: "APY 214.47%",
    risk: "High Risk",
  },
  {
    id: 4,
    color: "#07DBFA",
    name: "Liquid Staking",
    apy: "APY 214.47%",
    risk: "High Risk",
  },
  {
    id: 5,
    color: "#988AFC",
    name: "Camelot Staking",
    apy: "APY 214.47%",
    risk: "High Risk",
  },
];

const LegendItem = ({
  color,
  name,
  apy,
  risk,
}: {
  color: string;
  name: string;
  apy: string;
  risk: string;
}) => {
  return (
    <div className="flex items-center p-1 gap-1">
      <div className="flex justify-center items-center">
        <div
          className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        <span className="text-[10px] md:text-xs text-[rgba(0,0,0,0.7)]">
          {name}
        </span>
        <span className="text-[10px] md:text-xs text-[rgba(0,0,0,0.7)]">
          {apy}
        </span>
        <span className="text-[10px] md:text-xs text-red-500">{risk}</span>
      </div>
    </div>
  );
};

// Data for the balanced risk portfolio

// TODO: chart data and config should be synced
const chartData = [
  { name: "GMX Staking", value: 20 },
  { name: "AAVE Lending", value: 20 },
  { name: "Uniswap Liquidity", value: 20 },
  { name: "Liquid Staking", value: 20 },
  { name: "Camelot Staking", value: 20 },
];

// Define colors to match the original design
const COLORS = [
  "#7086FD", // GMX Strategy
  "#6FD195", // AAVE Lending Strategy
  "#FFAE4C", // Uniswap Liquidity
  "#07DBFA", // Liquid Staking
  "#988AFC", // Camelot Staking
];

const chartConfig = {
  value: {
    label: "Allocation",
  },
  "GMX Staking": {
    label: "GMX Staking",
    color: "#7086FD",
  },
  "AAVE Lending": {
    label: "AAVE Lending",
    color: "#6FD195",
  },
  "Uniswap Liquidity": {
    label: "Uniswap Liquidity",
    color: "#FFAE4C",
  },
  "Liquid Staking": {
    label: "Liquid Staking",
    color: "#07DBFA",
  },
  "Camelot Staking": {
    label: "Camelot Staking",
    color: "#988AFC",
  },
} satisfies ChartConfig;

export function PortfolioPieChart() {
  return (
    <Card className="flex flex-col">
      <div className="flex flex-col md:flex-row">
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[200px] md:max-h-[250px]"
          >
            <RechartsPieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                fill="#8884d8"
                label={(entry) => `${entry.value}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>

        <div className="flex-1 flex flex-col justify-center space-y-1 md:space-y-2 px-2 md:px-0">
          {strategies.map((strategy) => (
            <LegendItem
              key={strategy.id}
              color={strategy.color}
              name={strategy.name}
              apy={strategy.apy}
              risk={strategy.risk}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
