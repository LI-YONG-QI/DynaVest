"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
  { date: "31/3", desktop: 30 },
  { date: "5/4", desktop: 50 },
  { date: "12/4", desktop: 50 },
  { date: "19/4", desktop: 60 },
  { date: "26/4", desktop: 30 },
  { date: "3/5", desktop: 50 },
  { date: "10/5", desktop: 50 },
  { date: "17/5", desktop: 60 },
  { date: "24/5", desktop: 130 },
  { date: "31/5", desktop: 200 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function StrategyDetailsChart() {
  return (
    <Card>
      <CardContent className="p-2">
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ReferenceLine
              y={60}
              stroke="#10B981"
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="#5F79F1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
