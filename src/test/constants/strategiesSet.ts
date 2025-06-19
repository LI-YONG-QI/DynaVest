import { STRATEGIES_METADATA } from "@/constants/strategies";
import type {
  StrategiesSet,
  RiskLevel,
  RiskPortfolioStrategies,
} from "@/types";

// Helper function to convert StrategyMetadata to RiskPortfolioStrategies with allocation
const addAllocation = (
  strategy: (typeof STRATEGIES_METADATA)[0],
  allocation: number
): RiskPortfolioStrategies => ({
  ...strategy,
  allocation,
});

// Filter strategies by risk level
const getStrategiesByRisk = (riskLevel: RiskLevel) => {
  return STRATEGIES_METADATA.filter((s) => s.risk === riskLevel);
};

// Get all unique strategies for high airdrop potential (using specific protocols)
// const getAirdropStrategies = () => {
//   return STRATEGIES_METADATA.filter(
//     (s) => ["Uniswap", "Flow"].includes(s.protocol) && s.risk.level === "high"
//   ).slice(0, 2);
// };

// // Get a mix of strategies for balanced risk
// const getBalancedStrategies = () => {
//   const lowRisk = getStrategiesByRisk("low").slice(0, 1);
//   const mediumRisk = getStrategiesByRisk("medium").slice(0, 2);
//   const highRisk = getStrategiesByRisk("high").slice(0, 2);

//   return [...lowRisk, ...mediumRisk, ...highRisk];
// };

// Generate allocations based on strategy count and risk type
const generateAllocations = (
  strategies: typeof STRATEGIES_METADATA,
  riskType: RiskLevel
): number[] => {
  const count = strategies.length;
  if (count === 0) return [];

  switch (riskType) {
    case "low":
      // More weight on first strategies (lower risk ones)
      return Array(count)
        .fill(0)
        .map((_, i) => Math.max(30 - i * 5, 10))
        .map((val, _, arr) =>
          Math.round((val / arr.reduce((a, b) => a + b, 0)) * 100)
        );

    case "medium":
      // Balanced allocation with peak in middle
      return Array(count)
        .fill(0)
        .map((_, i) =>
          i === Math.floor(count / 2)
            ? 30
            : 15 + Math.abs(Math.floor(count / 2) - i) * 5
        )
        .map((val, _, arr) =>
          Math.round((val / arr.reduce((a, b) => a + b, 0)) * 100)
        );

    case "high":
      // Higher weights on later (higher risk) strategies
      return Array(count)
        .fill(0)
        .map((_, i) => 10 + i * 5)
        .map((val, _, arr) =>
          Math.round((val / arr.reduce((a, b) => a + b, 0)) * 100)
        );

    default:
      throw new Error("Invalid risk type");
  }
};

// Create the mock data structure
export const MOCK_STRATEGIES_SET: StrategiesSet = {
  // balanced: getBalancedStrategies().map((strategy, i, arr) =>
  //   addAllocation(strategy, generateAllocations(arr, "balanced")[i])
  // ),

  low: getStrategiesByRisk("low")
    .slice(0, 5)
    .map((strategy, i, arr) =>
      addAllocation(strategy, generateAllocations(arr, "low")[i])
    ),

  medium: getStrategiesByRisk("medium")
    .slice(0, 5)
    .map((strategy, i, arr) =>
      addAllocation(strategy, generateAllocations(arr, "medium")[i])
    ),

  high: getStrategiesByRisk("high")
    .slice(0, 5)
    .map((strategy, i, arr) =>
      addAllocation(strategy, generateAllocations(arr, "high")[i])
    ),

  // "high airdrop potential": getAirdropStrategies().map((strategy, i, arr) =>
  //   addAllocation(
  //     strategy,
  //     generateAllocations(arr, "high airdrop potential")[i]
  //   )
  // ),
};
