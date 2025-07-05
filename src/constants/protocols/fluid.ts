import { base } from "viem/chains";

import { Protocol } from "@/types/strategies";

export const FLUID = {
  name: "Fluid",
  description:
    "Fluid is a decentralized lending protocol that allows users to lend and borrow assets.",
  icon: "/crypto-icons/protocol/fluid.svg",
  link: "https://fluid.io/",
  contracts: {
    [base.id]: {
      fUSDC: "0xf42f5795D9ac7e9D757dB633D693cD548Cfd9169",
    },
  },
} as const satisfies Protocol;
