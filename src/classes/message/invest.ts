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
    // Fixed strategies to use for all risk levels
    const getFixedStrategies = () => {
      return STRATEGIES_METADATA.filter(
        (s) =>
          (s.protocol === "AaveV3Supply" ||
            s.protocol === "MorphoSupply" ||
            s.protocol === "UniswapV3SwapLST") &&
          s.chainId === chainId
      );
    };

    // Define allocation percentages for each risk level
    const getAllocationsByRisk = (riskLevel: RiskLevel): number[] => {
      switch (riskLevel) {
        case "low":
          // Conservative allocation: AAVE 60%, Morpho 30%, Uniswap 10%
          return [10, 20, 70];
        case "medium":
          // Balanced allocation: AAVE 40%, Morpho 40%, Uniswap 20%
          return [30, 20, 50];
        case "high":
          // Aggressive allocation: AAVE 20%, Morpho 30%, Uniswap 50%
          return [34, 33, 33];
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

    // Get the fixed strategies for this chain
    const availableStrategies = getFixedStrategies();

    // For each risk level, use the same strategies but with different allocations
    RISK_OPTIONS.forEach((riskLevel) => {
      const allocations = getAllocationsByRisk(riskLevel);

      strategiesSet[riskLevel] = availableStrategies
        .slice(0, 3)
        .map((strategy, i) => addAllocation(strategy, allocations[i] || 0));
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
