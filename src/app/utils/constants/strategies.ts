import { celo, flowMainnet, base, bsc, arbitrum, polygon } from "viem/chains";

import { USDC, CELO, FLOW, cEUR, ETH, BNB, cUSD } from "./coins";
import type { StrategyMetadata } from "../types";

export const BOT_STRATEGY: StrategyMetadata = {
  title: "Bot Strategy",
  apy: 0,
  risk: {
    level: "Low" as const,
    color: "",
    bgColor: "",
  },
  protocol: "Bot Strategy",
  description:
    "Staking CELO to operate network nodes helps to maintain security on the blockchain.",
  image: "/crypto-icons/celo.svg",
  externalLink: "https://stcelo.com",
  learnMoreLink: "https://stcelo.com",
  tokens: [USDC],
  chainId: base.id,
};

export const STRATEGIES_METADATA: StrategyMetadata[] = [
  {
    title: "GMX Strategy",
    apy: 214.47,
    risk: {
      level: "High" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "GMX",
    description:
      "Leveraged Beefy Vault on GMX, GMX is staked to earn ETH and esGMX. This ETH is compounded to more GMX",
    image: "/crypto-icons/arb.svg",
    externalLink: "https://app.beefy.com/vault/gmx-arb-gmx",
    learnMoreLink: "https://app.beefy.com/vault/gmx-arb-gmx",
    tokens: [ETH],
    chainId: arbitrum.id,
  },
  {
    title: "AAVE Lending Strategy",
    apy: 4.5,
    risk: {
      level: "Medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AAVE",
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
    apy: 35.4,
    risk: {
      level: "High" as const,
      color: "",
      bgColor: "",
    },
    protocol: "Uniswap",
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
    apy: 2.8,
    risk: {
      level: "Low" as const,
      color: "",
      bgColor: "",
    },
    protocol: "LST",
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    image: "/crypto-icons/arb.svg",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [ETH],
    chainId: arbitrum.id,
  },
  {
    title: "Camelot Staking",
    apy: 17.54,
    risk: {
      level: "Medium" as const,
      color: "",
      bgColor: "",
    },
    protocol: "Camelot",
    description: "Swap ETH to xGRAIL and stake it to Camelot to earn yield.",
    image: "/crypto-icons/arb.svg",
    externalLink: "https://app.camelot.exchange/xgrail/staking",
    learnMoreLink: "https://app.camelot.exchange/xgrail/staking",
    tokens: [ETH],
    chainId: arbitrum.id,
  },
  {
    title: "Morpho Supplying",
    apy: 6.7,
    risk: {
      level: "Medium" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "Morpho",
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
    apy: 6.1,
    risk: {
      level: "Medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AAVE",
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
    title: "Uniswap Liquidity",
    apy: 32.5,
    risk: {
      level: "High" as const,
      color: "",
      bgColor: "",
    },
    protocol: "Uniswap",
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
    apy: 2.8,
    risk: {
      level: "Low" as const,
      color: "",
      bgColor: "",
    },
    protocol: "LST",
    description:
      "Staking tokens to operate network nodes helps to maintain security on the blockchain.",
    image: "/crypto-icons/base.png",
    externalLink: "https://lido.fi/",
    learnMoreLink: "https://lido.fi/",
    tokens: [ETH],
    chainId: base.id,
  },
  {
    title: "AAVE Lending Strategy",
    apy: 4.3,
    risk: {
      level: "Medium" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "BSC Aave",
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
    apy: 39.1,
    risk: {
      level: "High" as const,
      color: "",
      bgColor: "",
    },
    protocol: "Uniswap",
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
    apy: 2.8,
    risk: {
      level: "Low" as const,
      color: "",
      bgColor: "",
    },
    protocol: "BSC LST",
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
    apy: 2.8,
    risk: {
      level: "Low" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "stCelo",
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
    apy: 69.405,
    risk: {
      level: "High" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "Uniswap",
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
    apy: 45.15,
    risk: {
      level: "High" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "Uniswap",
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
    apy: 5.7,
    risk: {
      level: "Medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AAVE",
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
    apy: 32.15,
    risk: {
      level: "High" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AAVE",
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
    apy: 4.3,
    risk: {
      level: "Low" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "Kitty",
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
    apy: 34.0,
    risk: {
      level: "High" as const,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.3)",
    },
    protocol: "Flow",
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
    apy: 5.1,
    risk: {
      level: "Medium" as const,
      color: "#B9AB15",
      bgColor: "rgba(230, 212, 9, 0.3)",
    },
    protocol: "AAVE",
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
  {
    title: "MiniPay Staking",
    apy: 2.8,
    risk: {
      level: "Low" as const,
      color: "#E83033",
      bgColor: "rgba(232, 48, 51, 0.3)",
    },
    protocol: "MiniPay stCelo",
    description:
      "Staking CELO to operate network nodes helps to maintain security on the blockchain.",
    image: "/crypto-icons/celo.svg",
    externalLink: "https://stcelo.com",
    learnMoreLink: "https://stcelo.com",
    tokens: [cUSD],
    chainId: celo.id,
  },
];
