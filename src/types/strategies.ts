import { Address } from "viem";

import type { PROTOCOLS } from "@/constants";
import { RISK_OPTIONS } from "@/constants/risk";
import { Token } from "./blockchain";

// TODO: need rename it
export type Protocols = Record<number, Record<string, Address>>;
export type ProtocolChains<T extends Protocols> = keyof T;
export type ProtocolContracts<T extends Protocols> = keyof T[keyof T];

export type Protocol = (typeof PROTOCOLS)[number];

export type StrategyMetadata = InvestStrategy & {
  displayInsufficientBalance?: boolean;
};

export type InvestStrategy = {
  title: string;
  id: string;
  apy: number;
  risk: {
    level: RiskLevel;
    color: string;
    bgColor: string;
  };
  protocol: Protocol;
  description: string;
  /** @deprecated This field is no longer in use */
  image: string;
  externalLink?: string;
  learnMoreLink?: string;
  chainId: number;
  tokens: Token[];
};

export type RiskLevel = (typeof RISK_OPTIONS)[number];

export type RiskPortfolioStrategies = StrategyMetadata & {
  allocation: number;
};

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
