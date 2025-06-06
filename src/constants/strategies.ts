import { celo, flowMainnet, base, bsc, arbitrum, polygon } from "viem/chains";

import type { StrategyMetadata } from "@/types";
import { USDC, CELO, FLOW, cEUR, ETH, BNB } from "@/constants/coins";

export const BOT_STRATEGY: StrategyMetadata = {
  title: "Bot Strategy",
  id: "bot-strategy",
  apy: 0,
  risk: {
    level: "low" as const,
    color: "",
    bgColor: "",
  },
  protocol: "AaveV3Supply",
  description: "Deposit USDC to multi strategies",
  image: "",
  externalLink: "",
  learnMoreLink: "",
  tokens: [USDC],
  chainId: base.id,
};

export const STRATEGIES_METADATA: StrategyMetadata[] = [
  {
    title: "GMX Strategy",
    id: "gmx-strategy",
    apy: 214.47,
    risk: {
      level: "high" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "GMXDeposit",
    description:
      "Leveraged Beefy Vault on GMX, GMX is staked to earn ETH and esGMX. This ETH is compounded to more GMX",
    image: "/crypto-icons/arb.svg",
    externalLink: "https://app.beefy.com/vault/gmx-arb-gmx",
    learnMoreLink: "https://app.beefy.com/vault/gmx-arb-gmx",
    tokens: [ETH],
    chainId: arbitrum.id,
  },
  {
    title: "AAVE Lending",
    id: "aave-lending",
    apy: 4.5,
    risk: {
      level: "medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/arb.svg",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xaf88d065e77c8cc2239327c5edb3a432268e5831&marketName=proto_arbitrum_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xaf88d065e77c8cc2239327c5edb3a432268e5831&marketName=proto_arbitrum_v3",
    tokens: [USDC],
    chainId: arbitrum.id,
  },
  {
    title: "Uniswap Liquidity",
    id: "uniswap-liquidity",
    apy: 35.4,
    risk: {
      level: "high" as const,
      color: "",
      bgColor: "",
    },
    protocol: "UniswapV3AddLiquidity",
    description:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    image: "/crypto-icons/arb.svg",
    externalLink:
      "https://app.uniswap.org/explore/pools/arbitrum/0xbE3aD6a5669Dc0B8b12FeBC03608860C31E2eef6",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/arbitrum/0xbE3aD6a5669Dc0B8b12FeBC03608860C31E2eef6",
    tokens: [USDC],
    chainId: arbitrum.id,
  },
  {
    title: "Liquid Staking",
    id: "liquid-staking",
    apy: 2.8,
    risk: {
      level: "low" as const,
      color: "",
      bgColor: "",
    },
    protocol: "UniswapV3SwapLST",
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    image: "/crypto-icons/arb.svg",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [USDC],
    chainId: arbitrum.id,
  },
  {
    title: "Camelot Staking",
    id: "camelot-staking",
    apy: 17.54,
    risk: {
      level: "medium" as const,
      color: "",
      bgColor: "",
    },
    protocol: "CamelotStaking",
    description: "Swap ETH to xGRAIL and stake it to Camelot to earn yield.",
    image: "/crypto-icons/arb.svg",
    externalLink: "https://app.camelot.exchange/xgrail/staking",
    learnMoreLink: "https://app.camelot.exchange/xgrail/staking",
    tokens: [ETH],
    chainId: arbitrum.id,
  },
  {
    title: "Morpho Supplying",
    id: "morpho-supplying",
    apy: 6.7,
    risk: {
      level: "medium" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "MorphoSupply",
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/base.png",
    externalLink:
      "https://app.morpho.org/base/market/0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda/weth-usdc",
    learnMoreLink:
      "https://app.morpho.org/base/market/0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda/weth-usdc",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "AAVE Lending Strategy",
    id: "aave-lending-strategy",
    apy: 6.1,
    risk: {
      level: "medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/base.png",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&marketName=proto_base_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&marketName=proto_base_v3",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "Uniswap Liquidity Narrow Range",
    id: "uniswap-liquidity-narrow-range",
    apy: 32.5,
    risk: {
      level: "high" as const,
      color: "",
      bgColor: "",
    },
    protocol: "UniswapV3AddLiquidity",
    description:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    image: "/crypto-icons/base.png",
    externalLink:
      "https://app.uniswap.org/explore/pools/base/0xD56da2B74bA826f19015E6B7Dd9Dae1903E85DA1",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/base/0xD56da2B74bA826f19015E6B7Dd9Dae1903E85DA1",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "Liquid Staking",
    id: "liquid-staking",
    apy: 2.8,
    risk: {
      level: "low" as const,
      color: "",
      bgColor: "",
    },
    protocol: "UniswapV3SwapLST",
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    image: "/crypto-icons/base.png",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "AAVE Lending Strategy",
    id: "aave-lending-strategy",
    apy: 4.3,
    risk: {
      level: "medium" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/bnb.svg",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d&marketName=proto_bnb_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d&marketName=proto_bnb_v3",
    tokens: [USDC],
    chainId: bsc.id,
  },
  {
    title: "Uniswap Liquidity",
    id: "uniswap-liquidity",
    apy: 39.1,
    risk: {
      level: "high" as const,
      color: "",
      bgColor: "",
    },
    protocol: "UniswapV3AddLiquidity",
    description:
      "Adding USDC and USDT to the Uniswap v3 USDC/USDT 0.01% pool enables users to earn swap fees by providing liquidity for trading between these stablecoins.",
    image: "/crypto-icons/bnb.svg",
    externalLink:
      "https://app.uniswap.org/explore/pools/bnb/0x2C3c320D49019D4f9A92352e947c7e5AcFE47D68",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/bnb/0x2C3c320D49019D4f9A92352e947c7e5AcFE47D68",
    tokens: [USDC],
    chainId: bsc.id,
  },
  {
    title: "Binance Liquid Staking",
    id: "binance-liquid-staking",
    apy: 2.8,
    risk: {
      level: "low" as const,
      color: "",
      bgColor: "",
    },
    protocol: "UniswapV3SwapLST",
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    image: "/crypto-icons/bnb.svg",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [BNB],
    chainId: bsc.id,
  },
  {
    title: "stCelo Staking",
    id: "stcelo-staking",
    apy: 2.8,
    risk: {
      level: "low" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "StCeloStaking",
    description:
      "Staking CELO to operate network nodes helps to maintain security on the blockchain.",
    image: "/crypto-icons/celo.svg",
    externalLink: "https://stcelo.com",
    learnMoreLink: "https://stcelo.com",
    tokens: [CELO],
    chainId: celo.id,
  },
  {
    title: "Uniswap Liquidity Stablecoin Pool",
    id: "uniswap-liquidity-stablecoin-pool",
    apy: 69.405,
    risk: {
      level: "high",
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "UniswapV3AddLiquidity",
    description:
      "Adding CELO and cEUR to the Uniswap v3 CELO/cEUR 1% pool enables users to earn swap fees by providing liquidity for trading",
    image: "/crypto-icons/celo.svg",
    externalLink:
      "https://app.uniswap.org/explore/pools/celo/0x978799F1845C00c9A4d9fd2629B9Ce18Df66e488",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/celo/0x978799F1845C00c9A4d9fd2629B9Ce18Df66e488",
    tokens: [CELO],
    chainId: celo.id,
  },
  {
    title: "Uniswap Liquidity + Liquid Staking",
    id: "uniswap-liquidity-liquid-staking",
    apy: 45.15,
    risk: {
      level: "high" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "UniswapV3AddLiquidity",
    description:
      "Adding CELO and stCelo to the Uniswap v3 CELO/stCelo 0.01% pool to earn swap fees and liquid staking rewards",
    image: "/crypto-icons/celo.svg",
    externalLink:
      "https://app.uniswap.org/explore/pools/celo/0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966",
    learnMoreLink:
      "https://app.uniswap.org/explore/pools/celo/0x60Ac25Da2ADA3be14a2a8C04e45b072BEd965966",
    tokens: [CELO],
    chainId: celo.id,
  },
  {
    title: "AAVE Supplying",
    id: "aave-supplying",
    apy: 5.7,
    risk: {
      level: "medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Supplying cEUR to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/celo.svg",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    tokens: [cEUR],
    chainId: celo.id,
  },
  {
    title: "AAVE Looping",
    id: "aave-looping",
    apy: 32.15,
    risk: {
      level: "high" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Looping is a recursive DeFi strategy of supplying and borrowing cEUR in repeated cycles to compound interest and token incentives",
    image: "/crypto-icons/celo.svg",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73&marketName=proto_celo_v3",
    tokens: [cEUR],
    chainId: celo.id,
  },
  {
    title: "Kitty",
    id: "kitty",
    apy: 4.3,
    risk: {
      level: "low" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "MorphoSupply",
    description:
      "Lending protocol that allows anyone to deposit and earn yield. Learn More",
    image: "/crypto-icons/flow.svg",
    externalLink: "https://kitty.com",
    learnMoreLink: "https://kitty.com",
    tokens: [FLOW],
    chainId: flowMainnet.id,
  },
  {
    title: "Flow Yield",
    id: "flow-yield",
    apy: 34.0,
    risk: {
      level: "high" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "CamelotStaking",
    description:
      "Providing ankrFlow tokens as liquidity to KittyStable allows you to earn both liquid staking rewards and swap fees.",
    image: "/crypto-icons/flow.svg",
    externalLink: "https://flow.com",
    learnMoreLink: "https://flow.com",
    tokens: [FLOW],
    chainId: flowMainnet.id,
  },
  {
    title: "AAVE Lending Strategy",
    id: "aave-lending-strategy",
    apy: 5.1,
    risk: {
      level: "medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/polygon.svg",
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
    id: "aave-lending-leverage",
    apy: 10.1,
    risk: {
      level: "low" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/polygon.svg",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    tokens: [USDC],
    chainId: base.id,
  },
  {
    title: "Uniswap Liquidity Full Range",
    id: "uniswap-liquidity-full-range",
    apy: 10.1,
    risk: {
      level: "low" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "AaveV3Supply",
    description:
      "Supplying USDC to AAVE Lending Protocol enables earning interest and rewards, maximizing returns in DeFi.",
    image: "/crypto-icons/polygon.svg",
    externalLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    learnMoreLink:
      "https://app.aave.com/reserve-overview/?underlyingAsset=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359&marketName=proto_polygon_v3",
    tokens: [USDC],
    chainId: base.id,
  },
];
