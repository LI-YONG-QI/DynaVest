"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

import { wagmiConfig } from "./config";
import PrivyAccountProvider from "@/contexts/PrivyAccountProvider";
import { AssetsProvider } from "@/contexts/AssetsContext";

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("Privy app ID is required");
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          walletChainType: "ethereum-only",
        },
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        supportedChains: [...wagmiConfig.chains],
      }}
    >
      <SmartWalletsProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <PrivyAccountProvider>
              <AssetsProvider>{children}</AssetsProvider>
            </PrivyAccountProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
