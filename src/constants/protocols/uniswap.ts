import { arbitrum, base, bsc } from "viem/chains";

// Uniswap protocol contract addresses for each network
export const UNISWAP = {
  name: "Uniswap",
  description:
    "Uniswap is a decentralized exchange that allows users to trade ERC20 tokens.",
  icon: "/crypto-icons/protocol/uniswap.svg",
  link: "https://uniswap.org/",
  contracts: {
    [base.id]: {
      swapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
      nftManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
    },
    [arbitrum.id]: {
      swapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      nftManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    },
    [bsc.id]: {
      swapRouter: "0xb971ef87ede563556b2ed4b1c0b0019111dd85d2",
      nftManager: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613",
    },
  },
} as const;
