export const PROTOCOLS_METADATA: Record<
  string,
  { icon: string; description: string }
> = {
  Aave: {
    icon: "/crypto-icons/aave.svg",
    description: "Most popular lending protocol on EVM",
  },
  Morpho: {
    icon: "/crypto-icons/morpho.svg",
    description: "Lending protocol for lending and borrowing assets",
  },
  Camelot: {
    icon: "/crypto-icons/camelot.svg",
    description: "DEX and yield farming protocol on Arbitrum",
  },
  StakedCelo: {
    icon: "/crypto-icons/celo.svg",
    description: "Liquid staking protocol for CELO tokens",
  },
  GMX: {
    icon: "/crypto-icons/gmx.svg",
    description: "Decentralized perpetual exchange",
  },
  UniswapV3: {
    icon: "/crypto-icons/uniswap.svg",
    description: "Leading decentralized exchange with concentrated liquidity",
  },
  Lido: {
    icon: "/crypto-icons/lido.png",
    description: "Liquid staking protocol for ETH",
  },
};

export const STRATEGIES_PROTOCOLS_MAPPING: Record<
  string,
  { icon: string; description: string }
> = {
  "Aave V3 Supply": PROTOCOLS_METADATA.Aave,
  "Morpho Supply": PROTOCOLS_METADATA.Morpho,
  "Camelot Staking": PROTOCOLS_METADATA.Camelot,
  "StakedCelo Staking": PROTOCOLS_METADATA.StakedCelo,
  "GMX Deposit": PROTOCOLS_METADATA.GMX,
  "Uniswap V3 Swap LST": PROTOCOLS_METADATA.Lido,
  "Uniswap V3 Add Liquidity": PROTOCOLS_METADATA.UniswapV3,
};

export function getProtocolMetadata(strategy: string) {
  const protocol = STRATEGIES_PROTOCOLS_MAPPING[strategy];
  if (!protocol) {
    throw new Error(`Protocol ${strategy} not found`);
  }

  return protocol;
}

/**
 * @deprecated unified strategy name (Aave V3 Supply = AaveV3Supply)
 */
export function getStrategy(strategy: string) {
  switch (strategy) {
    case "Aave V3 Supply":
      return "AaveV3Supply";
    case "Morpho Supply":
      return "MorphoSupply";
    case "Camelot Staking":
      return "CamelotStaking";
    case "StakedCelo Staking":
      return "StCeloStaking";
    case "GMX Deposit":
    default:
      throw new Error(`Strategy ${strategy} not found`);
  }
}
