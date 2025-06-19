import type { ChartConfig } from "@/components/ui/chart";
import type { PieStrategy, RiskPortfolioStrategies } from "@/types";


/**
 * Generates chart data from strategy information
 */
export const createChartData = (strategyData: PieStrategy[]) => {
  return strategyData.map((s) => ({
    name: s.name,
    value: s.allocation,
  }));
};

/**
 * Creates chart configuration based on strategy data
 */
export const createChartConfig = (strategyData: PieStrategy[]): ChartConfig => {
  return {
    value: { label: "Allocation" },
    ...Object.fromEntries(
      strategyData.map((s) => [s.name, { label: s.name, color: s.color }])
    ),
  };
};

export const createPieChartStrategies = (
  strategiesMetadata: RiskPortfolioStrategies[]
) => {
  return strategiesMetadata.map((strategy, index) => ({
    id: index + 1,
    color: strategy.color,
    name: strategy.title,
    apy: `APY ${strategy.apy}%`,
    risk: `${strategy.risk} Risk`,
    allocation: strategy.allocation,
  }));
};
