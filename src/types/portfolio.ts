// Required types for portfolio allocation
import { COLORS } from "@/utils/pie";
import { Token } from "./blockchain";
import { RiskLevel } from "./strategies";
import { USDC, ETH, BNB } from "@/constants/coins";

export type PortfolioType = "strategies" | "assets" | "risks";

export interface BasePortfolioItem {
  id: string;
  name: string;
  allocation: number;
  color: string;
}

export interface StrategyPortfolioItem extends BasePortfolioItem {
  type: "strategies";
  apy: number;
  risk: {
    level: RiskLevel;
    color: string;
    bgColor: string;
  };
  protocol: string;
  description: string;
  chainId: number;
  tokens: Token[];
  externalLink?: string;
}

export interface AssetPortfolioItem extends BasePortfolioItem {
  type: "assets";
  token: Token;
}

export interface RiskPortfolioItem extends BasePortfolioItem {
  type: "risks";
  level: RiskLevel;
  description?: string;
}

export type PortfolioItem =
  | StrategyPortfolioItem
  | AssetPortfolioItem
  | RiskPortfolioItem;

// Mock data generators
export const generateMockStrategies = (): StrategyPortfolioItem[] => [
  {
    id: "1",
    type: "strategies",
    name: "Aave Stablecoin Yield",
    apy: 4.8,
    risk: { level: "low", color: "#10B981", bgColor: "#D1FAE5" },
    protocol: "Aave",
    description: "Earn yield on stablecoins with minimal risk",
    chainId: 1,
    tokens: [
      {
        name: "USDC",
        icon: "/crypto-icons/usdc.svg",
        decimals: 6,
        isNativeToken: false,
      },
    ],
    allocation: 40,
    color: "#10B981",
    externalLink: "https://aave.com",
  },
  {
    id: "2",
    type: "strategies",
    name: "Curve ETH/stETH",
    apy: 3.2,
    risk: { level: "low", color: "#10B981", bgColor: "#D1FAE5" },
    protocol: "Curve",
    description: "Stable yield from ETH/stETH liquidity pool",
    chainId: 1,
    tokens: [
      {
        name: "ETH",
        icon: "/crypto-icons/eth.svg",
        decimals: 18,
        isNativeToken: true,
      },
    ],
    allocation: 30,
    color: "#0EA5E9",
    externalLink: "https://curve.fi",
  },
  {
    id: "3",
    type: "strategies",
    name: "Aave Variable Debt",
    apy: 2.5,
    risk: { level: "medium", color: "#F59E0B", bgColor: "#FEF3C7" },
    protocol: "Aave",
    description: "Variable rate lending on Aave",
    chainId: 1,
    tokens: [
      {
        name: "USDC",
        icon: "/crypto-icons/usdc.svg",
        decimals: 6,
        isNativeToken: false,
      },
    ],
    allocation: 20,
    color: "#F59E0B",
    externalLink: "https://aave.com",
  },
  {
    id: "4",
    type: "strategies",
    name: "Uniswap V3 ETH/USDC",
    apy: 12.7,
    risk: { level: "high", color: "#EF4444", bgColor: "#FEE2E2" },
    protocol: "Uniswap",
    description: "Concentrated liquidity with higher risk/reward",
    chainId: 1,
    tokens: [
      {
        name: "ETH",
        icon: "/crypto-icons/eth.svg",
        decimals: 18,
        isNativeToken: true,
      },
      {
        name: "USDC",
        icon: "/crypto-icons/usdc.svg",
        decimals: 6,
        isNativeToken: false,
      },
    ],
    allocation: 10,
    color: "#8B5CF6",
    externalLink: "https://uniswap.org",
  },
];

export const generateMockAssets = (): AssetPortfolioItem[] => [
  {
    id: "USDC",
    token: USDC,
    name: USDC.name,
    allocation: 40,
    color: COLORS[0],
    type: "assets",
  },
  {
    id: "ETH",
    token: ETH,
    name: ETH.name,
    allocation: 40,
    color: COLORS[1],
    type: "assets",
  },
  {
    id: "BNB",
    token: BNB,
    name: BNB.name,
    allocation: 10,
    color: COLORS[2],
    type: "assets",
  },
];

export const generateMockRisks = (): RiskPortfolioItem[] => [
  {
    id: "low",
    type: "risks",
    name: "Low Risk",
    level: "low",
    allocation: 40,
    color: COLORS[0],
    description: "Stablecoins and conservative yield strategies",
  },
  {
    id: "medium",
    type: "risks",
    name: "Medium Risk",
    level: "medium",
    allocation: 40,
    color: COLORS[1],
    description: "Blue-chip assets with moderate volatility",
  },
  {
    id: "high",
    type: "risks",
    name: "High Risk",
    level: "high",
    allocation: 20,
    color: COLORS[2],
    description: "High volatility assets and strategies",
  },
];
