"use client";
import { KernelAccountClient, KernelValidator } from "@zerodev/sdk";
import { createContext, useContext } from "react";
import { SendUserOperationParameters as ViemSendUserOperationParameters } from "viem/account-abstraction";
import { sendTransaction } from "viem/actions";

export type SendTransactionParameters = Parameters<typeof sendTransaction>[1];
export type SendUserOperationParameters = ViemSendUserOperationParameters;

export const accountProviders = [
  "privy",
  "dynamic",
  "turnkey",
  "local",
] as const;
export type AccountProviders = (typeof accountProviders)[number];

export type EmbeddedWallet = {
  provider: AccountProviders;
  address: `0x${string}`;
  user: string;
};

export interface AccountProviderContextInterface {
  provider: AccountProviders;
  embeddedWallet: EmbeddedWallet | undefined | null;
  isDeployed: boolean;
  login: () => Promise<void>;
  kernelAccountClient: KernelAccountClient | undefined | null;
  // kernelAccount: CreateKernelAccountReturnType<"0.7"> | SmartAccount | undefined | null;
  ecdsaValidator: KernelValidator<"ECDSAValidator"> | undefined | null;
}

export const AccountProviderContext =
  createContext<AccountProviderContextInterface>({
    provider:
      typeof window === "undefined"
        ? "privy"
        : (window?.localStorage?.getItem(
            "accountProvider"
          ) as AccountProviders),
    embeddedWallet: undefined,
    isDeployed: false,
    login: async () => {
      throw new Error("Not implemented");
    },
    kernelAccountClient: undefined,
    // kernelAccount: undefined,
    ecdsaValidator: undefined,
  });

export const useAccountProviderContext = () => {
  return useContext(AccountProviderContext);
};
