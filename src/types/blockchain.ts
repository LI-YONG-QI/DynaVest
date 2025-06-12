import type { TypedData, Address } from "viem";

export const PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const satisfies TypedData;

export type Token = {
  name: string;
  icon: string;
  decimals: number;
  isNativeToken: boolean;
  chains?: {
    [key: number]: Address;
  };
};

export type DepositAction = "Deposit" | "Change Amount";
