"use client";

import { useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import React from "react";
import { celo } from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";

// import ExportWalletButton from "../components/dev/ExportWalletBtn";

const Page = () => {
  const { chainId } = useAccount();
  const { chains, error: switchNetworkError, switchChain } = useSwitchChain();
  const { setActiveWallet } = useSetActiveWallet();
  const { wallets } = useWallets();

  console.log(switchNetworkError);
  console.log(chains);

  return (
    <div>
      <p>{chainId}</p>
      <button onClick={() => switchChain?.({ chainId: celo.id })}>
        Switch Chain
      </button>

      {wallets.map((wallet) => {
        return (
          <div
            key={wallet.address}
            className="flex min-w-full flex-row flex-wrap items-center justify-between gap-2 bg-slate-50 p-4"
          >
            <div>{wallet.address}</div>
            <button
              onClick={() => {
                setActiveWallet(wallet);
              }}
            >
              Make Active
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Page;
