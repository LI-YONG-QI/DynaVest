import { RISK_OPTIONS } from "@/constants/risk";
import { Token } from "./blockchain";

export type Protocol =
  | "1inch"
  | "AAVE"
  | "stCelo"
  | "ankrFlow"
  | "Kitty"
  | "Flow"
  | "Morpho"
  | "Uniswap"
  | "BSC Aave"
  | "LST"
  | "BSC LST"
  | "Camelot"
  | "GMX"
  | "Bot Strategy"
  | "MorphoAA";

export type StrategyMetadata = InvestStrategy & {
  displayInsufficientBalance?: boolean;
};

export type InvestStrategy = {
  title: string;
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
