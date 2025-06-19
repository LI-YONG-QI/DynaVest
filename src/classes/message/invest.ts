import { Message, MessageMetadata } from "./base";
import { PortfolioMessage } from "./portfolio";
import { STRATEGIES_METADATA } from "@/constants/strategies";
import { RiskLevel, RiskPortfolioStrategies, StrategiesSet } from "@/types";
import { RISK_OPTIONS } from "@/constants/risk";
import { wagmiConfig } from "@/providers/config";

export class InvestMessage extends Message {
  public amount: string = "0";
  public chain: number = wagmiConfig.chains[0].id;

  constructor(metadata: MessageMetadata, _chain?: number) {
    super(metadata);
    if (_chain) {
      this.chain = _chain;
    }
  }

  /**
   * Filters strategies by chain ID and generates allocations
   */
  private getStrategiesSetByChain(chainId: number): StrategiesSet {
    // Get strategies for medium and high risk (all 3 strategies)
    const getAllStrategies = () => {
      return STRATEGIES_METADATA.filter(
        (s) =>
          (s.id === "AaveV3Supply" ||
            s.id === "MorphoSupply" ||
            s.id === "UniswapV3SwapLST") &&
          s.chainId === chainId
      );
    };

    // Get strategies for low risk (only 2 strategies)
    const getLowRiskStrategies = () => {
      return STRATEGIES_METADATA.filter(
        (s) =>
          (s.id === "AaveV3Supply" || s.id === "UniswapV3SwapLST") &&
          s.chainId === chainId
      );
    };

    const getRandomAllocation = (lower: number, upper: number) => {
      const random = Math.floor(Math.random() * (upper - lower)) + lower;
      console.log("Random", random);
      return random;
    };

    // Define allocation percentages for each risk level
    const getAllocationsByRisk = (riskLevel: RiskLevel): number[] => {
      let aaveAllocation: number;
      let morphoAllocation: number;
      let lstAllocation: number;

      switch (riskLevel) {
        case "low":
          // Conservative allocation: AAVE 30%, Uniswap LST 70%

          aaveAllocation = getRandomAllocation(20, 50);
          return [aaveAllocation, 100 - aaveAllocation];
        case "medium":
          // Balanced allocation: AAVE 40%, Morpho 40%, Uniswap 20%
          aaveAllocation = getRandomAllocation(15, 30);
          morphoAllocation = getRandomAllocation(15, 30);
          lstAllocation = 100 - aaveAllocation - morphoAllocation;
          return [aaveAllocation, morphoAllocation, lstAllocation];
        case "high":
          // Aggressive allocation: AAVE 20%, Morpho 30%, Uniswap 50%
          aaveAllocation = getRandomAllocation(20, 50);
          morphoAllocation = getRandomAllocation(20, 50);
          lstAllocation = 100 - aaveAllocation - morphoAllocation;
          return [aaveAllocation, morphoAllocation, lstAllocation];
        default:
          throw new Error("Invalid risk type");
      }
    };

    // Helper function to convert StrategyMetadata to RiskPortfolioStrategies with allocation
    const addAllocation = (
      strategy: (typeof STRATEGIES_METADATA)[0],
      allocation: number
    ): RiskPortfolioStrategies => ({
      ...strategy,
      allocation,
    });

    // Create strategies set object
    const strategiesSet: StrategiesSet = {} as StrategiesSet;

    // For each risk level, use appropriate strategies with different allocations
    RISK_OPTIONS.forEach((riskLevel) => {
      const allocations = getAllocationsByRisk(riskLevel);

      if (riskLevel === "low") {
        // Use only 2 strategies for low risk
        const availableStrategies = getLowRiskStrategies();
        strategiesSet[riskLevel] = availableStrategies
          .slice(0, 2)
          .map((strategy, i) => addAllocation(strategy, allocations[i] || 0));
      } else {
        // Use all 3 strategies for medium and high risk
        const availableStrategies = getAllStrategies();
        strategiesSet[riskLevel] = availableStrategies
          .slice(0, 3)
          .map((strategy, i) => addAllocation(strategy, allocations[i] || 0));
      }
    });

    return strategiesSet;
  }

  next(): Message {
    // Get strategies filtered by chain
    const strategiesSet = this.getStrategiesSetByChain(this.chain);

    return new PortfolioMessage(
      this.createDefaultMetadata(`Portfolio: ${this.amount} USDC`),
      this.amount,
      this.chain,
      strategiesSet
    );
  }
}
