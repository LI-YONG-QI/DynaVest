import { Address, encodeFunctionData } from "viem";

import { ERC20_ABI } from "@/constants/abis";

const FEE_RECEIVER: Address = process.env.NEXT_PUBLIC_FEE_RECEIVER as Address;

export const calculateFee = (amount: bigint, fee: bigint = BigInt(5)) => {
  return {
    fee: (amount * fee) / BigInt(1000),
    amount: amount - (amount * fee) / BigInt(1000),
  };
};

export const addFeesCall = (
  asset: Address,
  isNativeToken: boolean,
  fee: bigint
) => {
  if (isNativeToken) {
    return {
      to: FEE_RECEIVER,
      value: fee,
    };
  } else {
    return {
      to: asset,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [FEE_RECEIVER, fee],
      }),
    };
  }
};
