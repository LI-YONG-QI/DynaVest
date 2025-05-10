"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";

import { wagmiConfig } from "./config";
import PrivyAccountProvider from "@/contexts/PrivyAccountProvider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("Privy app ID is required");
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        // Customize Privy's appearance in your app
        // Supported configs: logo, supported wallets and chains, theme colors.
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          //   walletList: ["metamask"],
          walletChainType: "ethereum-only",
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          showWalletUIs: false,
          createOnLogin: "users-without-wallets",
        },
        supportedChains: [...wagmiConfig.chains],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <PrivyAccountProvider>{children}</PrivyAccountProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
