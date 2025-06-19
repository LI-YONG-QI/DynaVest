import { arbitrum, base, bsc, celo } from "viem/chains";

import type { Protocol } from "@/types/strategies";

export const AAVE = {
  name: "Aave",
  description:
    "Aave is a decentralized lending protocol that allows users to lend and borrow assets.",
  icon: "/crypto-icons/protocol/aave.svg",
  link: "https://aave.com/",
  contracts: {
    [celo.id]: {
      pool: "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402",
    },
    [bsc.id]: {
      pool: "0x6807dc923806fE8Fd134338EABCA509979a7e0cB",
    },
    [arbitrum.id]: {
      pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    },
    [base.id]: {
      pool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    },
  },
} as const satisfies Protocol;
