import { Address } from "viem";

import type { STRATEGIES } from "@/constants";
import { RISK_OPTIONS } from "@/constants/risk";
import { Token } from "./blockchain";

export type Protocol = Record<number, Record<string, Address>>;
export type ProtocolChains<T extends Protocol> = keyof T;
export type ProtocolContracts<T extends Protocol> = keyof T[keyof T];

export type Strategy = (typeof STRATEGIES)[number];

export type StrategyMetadata = {
  title: string;
  id: Strategy;
  apy: number;
  risk: RiskLevel;
  protocol: Protocol;
  description: string;
  externalLink?: string;
  learnMoreLink?: string;
  chainId: number;
  tokens: Token[];
};

export type RiskLevel = (typeof RISK_OPTIONS)[number];
export type RiskPortfolioStrategies = StrategyMetadata & {
  allocation: number;
};

/**
 * represents a strategy with an allocation filtered by risk level
 */
export type StrategiesSet = Record<RiskLevel, RiskPortfolioStrategies[]>;
export type PieStrategy = {
  id: number;
  color: string;
  name: string;
  apy: string;
  risk: string;
  allocation: number;
};

export type StrategyDetailsChartToggleOption = "APY" | "TVL" | "PRICE";
export type InvestmentFormMode = "invest" | "withdraw" | "lp";
