import {
  useCreateWallet,
  useLogin,
  usePrivy,
  useSignAuthorization,
  useWallets,
} from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  create7702KernelAccount,
  create7702KernelAccountClient,
  signerToEcdsaValidator,
} from "@zerodev/ecdsa-validator";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useEffect, useMemo } from "react";
import { createWalletClient, custom, Hex, http } from "viem";
import { base } from "viem/chains";
import { usePublicClient } from "wagmi";
import { AccountProviderContext, EmbeddedWallet } from "./AccountContext";
import { KERNEL_V3_3, getEntryPoint } from "@zerodev/sdk/constants";
/**
 * Constants for the Privy account provider
 */

const PROVIDER = "privy";
export const PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
import { KernelVersionToAddressesMap } from "@zerodev/sdk/constants";
export const kernelVersion = KERNEL_V3_3;
export const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];
// export const sepoliaBundlerRpc = `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/11155111`;
// export const sepoliaPaymasterRpc = `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/11155111`;
export const baseBundlerRpc = `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/8453`;
export const basePaymasterRpc = `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/8453 `;
export const entryPoint = getEntryPoint("0.7");
export const EXPLORER_URL = base.blockExplorers.default.url;

/**
 * PrivyAccountProvider is a React component that manages authentication and wallet functionality
 * using Privy's authentication system. It handles wallet creation, kernel account setup,
 * and provides authentication UI components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 * @returns {JSX.Element} The provider component with authentication functionality
 */
const PrivyAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signAuthorization } = useSignAuthorization();

  const { login } = useLogin();

  const privyEmbeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
  }, [wallets]);

  /**
   * Creates a wallet client using the embedded wallet's ethereum provider
   * The configured wallet client or null if not available
   */
  const { data: privyAccount } = useQuery({
    queryKey: [PROVIDER, "walletClient", privyEmbeddedWallet?.address],
    queryFn: async () => {
      if (!privyEmbeddedWallet) {
        return null;
      }
      const walletClient = createWalletClient({
        account: privyEmbeddedWallet.address as Hex,
        chain: base,
        transport: custom(await privyEmbeddedWallet.getEthereumProvider()),
      });
      return walletClient;
    },
    enabled: !!privyEmbeddedWallet,
  });

  /**
   * Creates a public client for blockchain interactions
   * The configured public client or null if wallet client is not available
   */
  const basePublicClient = usePublicClient({
    chainId: base.id,
  });

  /**
   * Creates a paymaster client for handling gas payments
   * The configured paymaster client or null if public client is not available
   */
  const basePaymasterClient = useMemo(() => {
    if (!basePublicClient) return null;
    return createZeroDevPaymasterClient({
      chain: base,
      transport: http(basePaymasterRpc),
    });
  }, [basePublicClient]);

  /**
   * Creates an ECDSA validator for the kernel account
   * The configured validator or null if prerequisites are not met
   */
  const { data: kernelClients } = useQuery({
    queryKey: [
      PROVIDER,
      "kernelClient",
      privyAccount?.account.address,
      basePaymasterClient?.name,
      basePublicClient?.name,
    ],
    queryFn: async () => {
      if (!privyAccount || !basePublicClient || !basePaymasterClient)
        return null;

      const ecdsaValidator = await signerToEcdsaValidator(basePublicClient, {
        signer: privyAccount,
        entryPoint,
        kernelVersion,
      });

      const authorization = await signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress,
        chainId: base.id,
      });

      const kernelAccount = await create7702KernelAccount(basePublicClient, {
        signer: privyAccount,
        entryPoint,
        kernelVersion,
        eip7702Auth: authorization,
      });

      const kernelAccountClient = create7702KernelAccountClient({
        account: kernelAccount,
        chain: base,
        bundlerTransport: http(baseBundlerRpc),
        paymaster: basePaymasterClient,
        client: basePublicClient,
      });

      return { kernelAccountClient, kernelAccount, ecdsaValidator };
    },
    enabled: !!basePublicClient && !!privyAccount && !!basePaymasterClient,
  });

  /**
   * Handles the sign-in process by opening the Privy sign-in modal
   */
  const signIn = async () => {
    // setOpenPrivySignInModal(true);
    login();
  };

  /**
   * Mutation hook for creating a new embedded wallet
   * The mutation object with createEmbeddedWallet function
   */
  const { mutate: createEmbeddedWallet } = useMutation({
    mutationFn: async () => {
      const newEmbeddedWallet = await createWallet();
      return newEmbeddedWallet;
    },
  });

  useEffect(() => {
    if (user) {
      if (!privyEmbeddedWallet) {
        createEmbeddedWallet();
      }
    }
  }, [user, privyEmbeddedWallet, createEmbeddedWallet]);

  const { data: embeddedWallet } = useQuery<EmbeddedWallet | null>({
    queryKey: [PROVIDER, "embeddedWallet", privyEmbeddedWallet?.address, user],
    queryFn: async () => {
      if (!user) return null;
      if (!privyEmbeddedWallet) return null;

      return {
        provider: "privy",
        address: privyEmbeddedWallet.address as `0x${string}`,
        user: user.email?.address ?? user.id,
      };
    },
    enabled: !!privyEmbeddedWallet && !!user,
  });

  const { data: isDeployed } = useQuery({
    queryKey: [PROVIDER, "isDeployed", kernelClients?.kernelAccount.address],
    queryFn: async () => {
      if (!kernelClients) return false;
      return kernelClients.kernelAccount.isDeployed();
    },
    enabled: !!kernelClients?.kernelAccount,
    refetchInterval: ({ state }) => (state.data ? false : 2000),
  });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "privy",
        login: signIn,
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        kernelAccountClient: kernelClients?.kernelAccountClient,
        ecdsaValidator: kernelClients?.ecdsaValidator,
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  );
};

export default PrivyAccountProvider;
