import { wagmiConfig } from "@/providers/config";

const chains = wagmiConfig.chains;
console.log(chains);

export const CHAINS = wagmiConfig.chains.map((chain) => {
  return {
    ...chain,
    icon: `/crypto-icons/chains/${chain.id}.svg`,
  };
});

export const getChainName = (chainId: number) => {
  return CHAINS.find((chain) => chain.id === chainId)?.name;
};

export const getChainById = (chainId: number) => {
  return CHAINS.find((chain) => chain.id === chainId);
};
