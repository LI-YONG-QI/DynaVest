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
  AaveV3Supply: PROTOCOLS_METADATA.Aave,
  MorphoSupply: PROTOCOLS_METADATA.Morpho,
  CamelotStaking: PROTOCOLS_METADATA.Camelot,
  StCeloStaking: PROTOCOLS_METADATA.StakedCelo,
  GMXDeposit: PROTOCOLS_METADATA.GMX,
  UniswapV3SwapLST: PROTOCOLS_METADATA.Lido,
  UniswapV3AddLiquidity: PROTOCOLS_METADATA.UniswapV3,
};

export function getProtocolMetadata(strategy: string) {
  const protocol = STRATEGIES_PROTOCOLS_MAPPING[strategy];
  if (!protocol) {
    throw new Error(`Protocol ${strategy} not found`);
  }

  return protocol;
}
