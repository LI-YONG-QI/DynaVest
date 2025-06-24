import { celo, flowMainnet, base, bsc, arbitrum, polygon } from "viem/chains";

import type { StrategyMetadata } from "@/types";
import { USDC, CELO, FLOW, cEUR, BNB } from "@/constants/coins";
import { AAVE, UNISWAP, MORPHO, LIDO, FLUID } from "./protocols";

export const STRATEGIES = [
  "AaveV3Supply",
  "StCeloStaking",
  "MorphoSupply",
  "UniswapV3AddLiquidity",
  "UniswapV3SwapLST",
  "CamelotStaking",
  "GMXDeposit",
  "MultiStrategy",
  "FluidSupply",
] as const;

export const BOT_STRATEGY: StrategyMetadata = {
  title: "Bot Strategy",
  id: "MultiStrategy",
  apy: 0,
  risk: "low",
  protocol: AAVE,
  description: "",
  fullDescription: "",
  externalLink: "",
  learnMoreLink: "",
  tokens: [USDC],
  chainId: base.id,
  color: "#1000FF",
};

export const STRATEGIES_METADATA: StrategyMetadata[] = [
  {
    title: "AAVE Lending",
    id: "AaveV3Supply",
    apy: 4.5,
    risk: "medium",
    color: "#9896FF",
    protocol: AAVE,
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xaf88d065e77c8cc2239327c5edb3a432268e5831&marketName=proto_arbitrum_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xaf88d065e77c8cc2239327c5edb3a432268e5831&marketName=proto_arbitrum_v3",
    tokens: [USDC],
    chainId: arbitrum.id,
  },
  {
    title: "Uniswap Liquidity",
    id: "UniswapV3AddLiquidity",
    apy: 35.4,
    risk: "high",
    color: "#1000FF",
    protocol: UNISWAP,
    description:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    fullDescription:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    externalLink:
      "https://app.uniswap.org/explore/pools/arbitrum/0xbE3aD6a5669Dc0B8b12FeBC03608860C31E2eef6",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/arbitrum/0xbE3aD6a5669Dc0B8b12FeBC03608860C31E2eef6",
    tokens: [USDC],
    chainId: arbitrum.id,
  },
  {
    title: "Liquid Staking",
    id: "UniswapV3SwapLST",
    apy: 2.8,
    risk: "low",
    color: "#F50DB5",
    protocol: LIDO,
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    fullDescription:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [USDC],
    chainId: arbitrum.id,
  },
  // {
  //   title: "Camelot Staking",
  //   id: "CamelotStaking",
  //   apy: 17.54,
  //   risk: "medium",
  //   protocol: CAMELOT_CONTRACTS,
  //   description: "Swap ETH to xGRAIL and stake it to Camelot to earn yield.",
  //   externalLink: "https://app.camelot.exchange/xgrail/staking",
  //   learnMoreLink: "https://app.camelot.exchange/xgrail/staking",
  //   tokens: [ETH],
  //   chainId: arbitrum.id,
  // },
  {
    title: "Morpho Supplying",
    id: "MorphoSupply",
    apy: 6.7,
    risk: "medium",
    color: "#C4DAFF",
    protocol: MORPHO,
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.morpho.org/base/market/0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda/weth-usdc",
    learnMoreLink:
      "https://app.morpho.org/base/market/0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda/weth-usdc",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "AAVE Supplying",
    id: "AaveV3Supply",
    apy: 6.1,
    risk: "medium",
    color: "#9896FF",
    protocol: AAVE,
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&marketName=proto_base_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&marketName=proto_base_v3",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "Uniswap Liquidity Narrow Range",
    id: "UniswapV3AddLiquidity",
    apy: 32.5,
    risk: "high",
    color: "#CE0000",
    protocol: UNISWAP,
    description:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    fullDescription:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    externalLink:
      "https://app.uniswap.org/explore/pools/base/0xD56da2B74bA826f19015E6B7Dd9Dae1903E85DA1",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/base/0xD56da2B74bA826f19015E6B7Dd9Dae1903E85DA1",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "Liquid Staking",
    id: "UniswapV3SwapLST",
    apy: 2.8,
    risk: "low",
    color: "#F50DB5",
    protocol: LIDO,
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    fullDescription:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "AAVE Supplying",
    id: "AaveV3Supply",
    apy: 4.3,
    risk: "medium",
    color: "#1000FF",
    protocol: AAVE,
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d&marketName=proto_bnb_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d&marketName=proto_bnb_v3",
    tokens: [USDC],
    chainId: bsc.id,
  },
  {
    title: "Uniswap Liquidity",
    id: "UniswapV3AddLiquidity",
    apy: 39.1,
    risk: "high",
    color: "#1000FF",
    protocol: UNISWAP,
    description:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    fullDescription:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    externalLink:
      "https://app.uniswap.org/explore/pools/bnb/0x2C3c320D49019D4f9A92352e947c7e5AcFE47D68",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/bnb/0x2C3c320D49019D4f9A92352e947c7e5AcFE47D68",
    tokens: [USDC],
    chainId: bsc.id,
  },
  {
    title: "Binance Liquid Staking",
    id: "UniswapV3SwapLST",
    apy: 2.8,
    risk: "low",
    color: "#1000FF",
    protocol: LIDO,
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    fullDescription:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [BNB],
    chainId: bsc.id,
  },
  // {
  //   title: "stCelo Staking",
  //   id: "StCeloStaking",
  //   apy: 2.8,
  //   risk: "low",
  //   protocol: ST_CELO_CONTRACTS,
  //   description:
  //     "Staking CELO to operate network nodes helps to maintain security on the blockchain.",
  //   externalLink: "https://stcelo.com",
  //   learnMoreLink: "https://stcelo.com",
  //   tokens: [CELO],
  //   chainId: celo.id,
  // },
  {
    title: "Uniswap Liquidity Stablecoin Pool",
    id: "UniswapV3AddLiquidity",
    apy: 69.405,
    risk: "high",
    color: "#1000FF",
    protocol: UNISWAP,
    description:
      "Adding CELO and cEUR to the Uniswap v3 CELO/cEUR 1% pool enables users to earn swap fees by providing liquidity for trading",
    fullDescription:
      "Adding CELO and cEUR to the Uniswap v3 CELO/cEUR 1% pool enables users to earn swap fees by providing liquidity for trading",
    externalLink:
      "https://app.uniswap.org/explore/pools/celo/0x978799F1845C00c9A4d9fd2629B9Ce18Df66e488",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/celo/0x978799F1845C00c9A4d9fd2629B9Ce18Df66e488",
    tokens: [CELO],
    chainId: celo.id,
  },
  {
    title: "Uniswap Liquidity + Liquid Staking",
    id: "UniswapV3AddLiquidity",
    apy: 45.15,
    risk: "high",
    color: "#1000FF",
    protocol: UNISWAP,
    description:
      "Adding CELO and stCelo to the Uniswap v3 CELO/stCelo 0.01% pool to earn swap fees and liquid staking rewards",
    fullDescription:
      "Adding CELO and stCelo to the Uniswap v3 CELO/stCelo 0.01% pool to earn swap fees and liquid staking rewards",
    externalLink:
      "https://app.uniswap.org/explore/pools/celo/0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/celo/0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966",
    tokens: [CELO],
    chainId: celo.id,
  },
  {
    title: "AAVE Supplying",
    id: "AaveV3Supply",
    apy: 5.7,
    risk: "medium",
    color: "#1000FF",
    protocol: AAVE,
    description:
      "Supplying cEUR to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying cEUR to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    tokens: [cEUR],
    chainId: celo.id,
  },
  {
    title: "AAVE Looping",
    id: "AaveV3Supply",
    apy: 32.15,
    risk: "high",
    color: "#1000FF",
    protocol: AAVE,
    description:
      "Looping is a recursive DeFi strategy of supplying and borrowing cEUR in repeated cycles to compound interest and token incentives",
    fullDescription:
      "Looping is a recursive DeFi strategy of supplying and borrowing cEUR in repeated cycles to compound interest and token incentives",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    tokens: [cEUR],
    chainId: celo.id,
  },
  {
    title: "Kitty",
    id: "MorphoSupply",
    apy: 4.3,
    risk: "low",
    color: "#1000FF",
    protocol: MORPHO,
    description:
      "Lending protocol that allows anyone to deposit and earn yield. Learn More",
    fullDescription:
      "Lending protocol that allows anyone to deposit and earn yield. Learn More",
    externalLink: "https://kitty.com",
    learnMoreLink: "https://kitty.com",
    tokens: [FLOW],
    chainId: flowMainnet.id,
  },
  // {
  //   title: "Flow Yield",
  //   id: "CamelotStaking",
  //   apy: 34.0,
  //   risk: "high",
  //   protocol: CAMELOT_CONTRACTS,
  //   description:
  //     "Providing ankrFlow tokens as liquidity to KittyStable allows you to earn both liquid staking rewards and swap fees.",
  //   externalLink: "https://flow.com",
  //   learnMoreLink: "https://flow.com",
  //   tokens: [FLOW],
  //   chainId: flowMainnet.id,
  // },
  {
    title: "AAVE Supplying",
    id: "AaveV3Supply",
    apy: 5.1,
    risk: "medium",
    color: "#1000FF",
    protocol: AAVE,
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    tokens: [USDC],
    chainId: polygon.id,
  },
  // TODO: mock for demo
  {
    title: "Aave Lending Leverage",
    id: "UniswapV3AddLiquidity",
    apy: 10.1,
    risk: "low",
    color: "#1000FF",
    protocol: AAVE,
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "Uniswap Liquidity Full Range",
    id: "UniswapV3AddLiquidity",
    apy: 10.1,
    risk: "low",
    color: "#1000FF",
    protocol: UNISWAP,
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "Fluid Supplying",
    id: "FluidSupply",
    apy: 6.23,
    risk: "medium",
    color: "#3f75ff",
    protocol: FLUID,
    description:
      "Supplying USDC to Fluid Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    fullDescription:
      "Supplying USDC to Fluid Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    externalLink: "https://fluid.io/",
    learnMoreLink: "https://fluid.io/",
    tokens: [USDC],
    chainId: base.id,
  },
];
