import type { Protocol } from "@/types/strategies";

// Uniswap protocol contract addresses for each network
export const Lido = {
  name: "Lido",
  description:
    "Lido is a liquid staking protocol that allows users to stake their ETH and earn staking rewards.",
  icon: "/crypto-icons/protocol/lido.png",
  link: "https://lido.fi/",
  contracts: {},
} as const satisfies Protocol;
