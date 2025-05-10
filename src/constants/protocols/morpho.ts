import { Address } from "viem";
import { base, baseSepolia } from "viem/chains";

export type MorphoSupportedChains = typeof base.id | typeof baseSepolia.id;

export const MORPHO_CONTRACTS: Record<
  MorphoSupportedChains,
  {
    morpho: Address;
  }
> = {
  [base.id]: {
    morpho: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  },
  [baseSepolia.id]: {
    morpho: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  },
};
