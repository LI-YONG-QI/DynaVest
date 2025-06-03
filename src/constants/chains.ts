import { wagmiConfig } from "@/providers/config";

export const CHAINS = wagmiConfig.chains.map((chain) => {
  return {
    ...chain,
    icon: `/crypto-icons/chains/${chain.id}.svg`,
  };
});

export const getChainName = (chainId: number) => {
  return CHAINS.find((chain) => chain.id === chainId)?.name;
};
