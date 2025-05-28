"use client";

import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LegendItem } from "./LegendItem";
import { PieStrategy, PieAssets, PieRisks } from "@/types";
import { createChartConfig, createChartData, COLORS } from "@/utils/pie";

// Simple color palette for the chart
export function PortfolioPieChart({
  pieStrategies,
}: {
  pieStrategies: PieStrategy[] | PieAssets[] | PieRisks[];
}) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  const chartData = createChartData(pieStrategies);
  const chartConfig = createChartConfig(pieStrategies);

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
          {pieStrategies.map((strategy) => (
            <LegendItem
              key={strategy.id}
              color={strategy.color}
              name={strategy.name}
              {...('apy' in strategy && { apy: strategy.apy })}
              {...('risk' in strategy && { risk: strategy.risk })}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
