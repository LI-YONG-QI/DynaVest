import { base } from "viem/chains";
import type { Protocol } from "@/types/strategies";

export const MORPHO_CONTRACTS: Protocol = {
  [base.id]: {
    morpho: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  },
} as const;
