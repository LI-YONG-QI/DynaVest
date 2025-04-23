import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";

import { useSwitchChain as useSwitch } from "wagmi";

export default function useSwitchChain(targetChainId: number) {
  const { wallets, ready } = useWallets();
  const chainId = useChainId();
  const [isSupportedChain, setIsSupportedChain] = useState<boolean>(false);

  const { chains, error: switchNetworkError, switchChain } = useSwitch();

  const handleSwitchChain = async () => {
    try {
      if (!wallets || wallets.length === 0) {
        toast.error("No wallet found. Please connect a wallet first.");
        return;
      }

      console.log(wallets);

      const wallet = wallets[0];

      // Check if wallet supports chain switching
      if (!wallet.switchChain) {
        toast.error("This wallet doesn't support chain switching");
        return;
      }

      // Add a small delay before switching chains
      await new Promise((resolve) => setTimeout(resolve, 500));

      await wallet.switchChain(targetChainId);
      toast.success(`Switched chain to ${targetChainId}`);
    } catch (error: unknown) {
      console.error("Failed to switch chain:", error);

      // Handle specific error messages
      if (error instanceof Error) {
        if (
          error.message.includes("rejected") ||
          error.message.includes("denied")
        ) {
          toast.error("Chain switch was rejected by the user");
        } else if (
          error.message.includes("already processing") ||
          error.message.includes("pending")
        ) {
          toast.warning(
            "Another request is in progress. Please try again after it completes."
          );
        } else {
          toast.error(`Failed to switch chain: ${error.message}`);
        }
      } else {
        toast.error(
          "Failed to switch chain. Please try manually switching in your wallet."
        );
      }
    }
  };

  useEffect(() => {
    if (chainId === targetChainId) {
      setIsSupportedChain(true);
    } else {
      setIsSupportedChain(false);
    }
  }, [chainId, targetChainId, ready]);

  return { handleSwitchChain, isSupportedChain, ready };
}
