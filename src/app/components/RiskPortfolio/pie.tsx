"use client";

import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import { useEffect, useState } from "react";

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
    color: "#6FD195",
    name: "AAVE Lending",
    apy: "APY 5.7%",
    risk: "Low Risk",
  },
  {
    id: 2,
    color: "#07DBFA",
    name: "stCelo Stake",
    apy: "APY 2.8%",
    risk: "Low Risk",
  },
  {
    id: 3,
    color: "#FFAE4C",
    name: "Uniswap Liquidity",
    apy: "APY 45.15%",
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
        <span
          className={`text-[10px] md:text-xs ${
            risk === "Low Risk" ? "text-green-500" : "text-red-500"
          }`}
        >
          {risk}
        </span>
      </div>
    </div>
  );
};

// Data for the balanced risk portfolio

// TODO: chart data and config should be synced
const chartData = [
  { name: "AAVE Lending", value: 36 },
  { name: "stCelo Stake", value: 44 },
  { name: "Uniswap Liquidity", value: 20 },
];

// Define colors to match the original design
const COLORS = [
  "#6FD195", // AAVE Lending Strategy
  "#07DBFA", // stCelo Stake
  "#FFAE4C", // Uniswap Liquidity
];

const chartConfig = {
  value: {
    label: "Allocation",
  },
  "AAVE Lending": {
    label: "AAVE Lending",
    color: "#6FD195",
  },
  "stCelo Stake": {
    label: "stCelo Stake",
    color: "#07DBFA",
  },
  "Uniswap Liquidity": {
    label: "Uniswap Liquidity",
    color: "#FFAE4C",
  },
} satisfies ChartConfig;

export function PortfolioPieChart() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card className="flex flex-col">
      <div className="flex flex-col md:flex-row">
        <CardContent className="flex-1 pb-0 flex justify-center px-0 ">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[240px] max-h-[240px] md:max-h-[300px]"
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
                outerRadius={60}
                fill="#8884d8"
                labelLine={windowWidth > 375 ? true : false}
                label={({ cx, cy, midAngle, outerRadius, index, value }) => {
                  const RADIAN = Math.PI / 180;
                  // Increase distance from pie chart to avoid overlap
                  const radius =
                    windowWidth <= 375
                      ? outerRadius * 1.25 // Even more space on small screens
                      : outerRadius * 1.45; // More space on larger screens

                  // Calculate label position
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  // Determine text anchor based on position
                  const textAnchor =
                    windowWidth <= 375
                      ? "middle" // Center-aligned on small screens
                      : x > cx
                      ? "start"
                      : "end"; // Based on position on larger screens

                  return (
                    <text
                      x={x}
                      y={y}
                      fill={COLORS[index % COLORS.length]}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      className="text-[10px] md:text-xs font-medium"
                    >
                      {`${value}%`}
                    </text>
                  );
                }}
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

        <div className="flex-1 flex flex-col justify-center space-y-1 md:space-y-2 px-2 md:px-0 mt-10">
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
