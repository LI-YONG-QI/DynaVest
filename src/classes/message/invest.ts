import { Message, MessageMetadata } from "./base";
import { PortfolioMessage } from "./portfolio";
import { STRATEGIES_METADATA } from "@/constants/strategies";
import {
  RiskLevel,
  RiskPortfolioStrategies,
  Strategy,
  StrategiesSet,
} from "@/types";
import { RISK_OPTIONS } from "@/constants/risk";
import { wagmiConfig } from "@/providers/config";
import { base, arbitrum } from "viem/chains";

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
   * Chain-specific strategy configurations
   * This allows easy extension for new chains while maintaining clean separation
   *
   * For each strategy, we define:
   * - strategyId: The ID of the strategy
   * - allocationRange: [min, max] percentage range for random allocation
   *
   * The last strategy in each array will receive the remaining allocation to ensure total = 100%
   */
  private static readonly CHAIN_STRATEGY_CONFIGS = {
    [base.id]: {
      // Base chain supports all three strategies
      riskLevelStrategies: {
        low: [
          { strategyId: "AaveV3Supply", allocationRange: [30, 50] },
          { strategyId: "UniswapV3SwapLST", allocationRange: null }, // Will be adjusted to ensure 100% total
        ],
        medium: [
          { strategyId: "AaveV3Supply", allocationRange: [15, 30] },
          { strategyId: "MorphoSupply", allocationRange: [15, 30] },
          { strategyId: "UniswapV3SwapLST", allocationRange: null }, // Will be adjusted to ensure 100% total
        ],
        high: [
          { strategyId: "AaveV3Supply", allocationRange: [20, 40] },
          { strategyId: "FluidSupply", allocationRange: [20, 40] },
          { strategyId: "MorphoSupply", allocationRange: null }, // Will be adjusted to ensure 100% total
        ],
      } as Record<
        RiskLevel,
        Array<{ strategyId: Strategy; allocationRange: [number, number] }>
      >,
    },
    [arbitrum.id]: {
      // Arbitrum only supports AaveV3Supply and UniswapV3SwapLST (no MorphoSupply)
      riskLevelStrategies: {
        low: [
          { strategyId: "AaveV3Supply", allocationRange: [30, 40] },
          { strategyId: "UniswapV3SwapLST", allocationRange: null }, // Will be adjusted to ensure 100% total
        ],
        medium: [
          { strategyId: "AaveV3Supply", allocationRange: [40, 60] },
          { strategyId: "UniswapV3SwapLST", allocationRange: null }, // Will be adjusted to ensure 100% total
        ],
        high: [
          { strategyId: "AaveV3Supply", allocationRange: [60, 80] },
          { strategyId: "UniswapV3SwapLST", allocationRange: null }, // Will be adjusted to ensure 100% total
        ],
      } as Record<
        RiskLevel,
        Array<{ strategyId: string; allocationRange: [number, number] | null }>
      >,
    },
    // Add more chains here as needed with their specific strategy configurations
    // [polygon.id]: {
    //   riskLevelStrategies: {
    //     low: [
    //       { strategyId: "AaveV3Supply", allocationRange: [70, 100] },
    //     ],
    //     medium: [
    //       { strategyId: "AaveV3Supply", allocationRange: [40, 60] },
    //       { strategyId: "UniswapV3SwapLST", allocationRange: [40, 60] },
    //     ],
    //     high: [
    //       { strategyId: "AaveV3Supply", allocationRange: [20, 40] },
    //       { strategyId: "UniswapV3SwapLST", allocationRange: [60, 80] },
    //     ],
    //   } as Record<RiskLevel, Array<{ strategyId: string; allocationRange: [number, number] }>>,
    // },
  } as const;

  /**
   * Filters strategies by chain ID and generates allocations
   */
  private getStrategiesSetByChain(chainId: number): StrategiesSet {
    // Get chain-specific strategy configuration
    const chainConfig =
      InvestMessage.CHAIN_STRATEGY_CONFIGS[
        chainId as keyof typeof InvestMessage.CHAIN_STRATEGY_CONFIGS
      ];

    if (!chainConfig) {
      throw new Error(
        `Chain ${chainId} is not supported yet. Please add configuration for this chain.`
      );
    }

    // Helper function to get a random number within a range
    const getRandomAllocation = (lower: number, upper: number) => {
      return Math.floor(Math.random() * (upper - lower + 1)) + lower;
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
      const strategyConfigs = chainConfig.riskLevelStrategies[riskLevel];

      if (!strategyConfigs || strategyConfigs.length === 0) {
        strategiesSet[riskLevel] = [];
        return;
      }

      // Get strategy IDs for this risk level
      const strategyIds = strategyConfigs.map((config) => config.strategyId);

      // Find matching strategies in STRATEGIES_METADATA
      const availableStrategies = STRATEGIES_METADATA.filter(
        (s) => strategyIds.includes(s.id) && s.chainId === chainId
      );

      console.log(availableStrategies);

      // If we couldn't find all strategies, log a warning
      if (availableStrategies.length !== strategyIds.length) {
        console.warn(
          `Some strategies configured for chain ${chainId} and risk level ${riskLevel} were not found in STRATEGIES_METADATA`
        );
      }

      // Generate allocations based on configured ranges
      const allocations: number[] = [];
      let remainingAllocation = 100;

      // Process all strategies except the last one
      for (let i = 0; i < strategyConfigs.length - 1; i++) {
        const config = strategyConfigs[i];
        if (config.allocationRange !== null) {
          const [min, max] = config.allocationRange;

          // Adjust max if needed to ensure we don't over-allocate
          const adjustedMax = Math.min(
            max,
            remainingAllocation - (strategyConfigs.length - i - 1)
          );
          const adjustedMin = Math.min(min, adjustedMax);

          // Get random allocation within adjusted range
          const allocation =
            adjustedMin === adjustedMax
              ? adjustedMin
              : getRandomAllocation(adjustedMin, adjustedMax);

          allocations.push(allocation);
          remainingAllocation -= allocation;
        } else {
          continue;
        }
      }

      // Last strategy gets the remaining allocation
      allocations.push(remainingAllocation);

      // Map strategies to their allocations
      strategiesSet[riskLevel] = availableStrategies.map((strategy, i) =>
        addAllocation(strategy, allocations[i] || 0)
      );
    });

    return strategiesSet;
  }

  next(): Message {
    // Get strategies filtered by chain
    const strategiesSet = this.getStrategiesSetByChain(this.chain);

    console.log(strategiesSet);

    return new PortfolioMessage(
      this.createDefaultMetadata(`Portfolio: ${this.amount} USDC`),
      this.amount,
      this.chain,
      strategiesSet
    );
  }
}
