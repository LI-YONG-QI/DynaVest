import { base } from "viem/chains";
import type { Protocol } from "@/types/strategies";

export const MORPHO: Protocol = {
  name: "Morpho",
  description:
    "Morpho is a decentralized lending protocol that allows users to lend and borrow assets.",
  icon: "/crypto-icons/protocol/morpho.svg",
  link: "https://morpho.org/",
  contracts: {
    [base.id]: {
      morpho: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    },
  },
} as const;
