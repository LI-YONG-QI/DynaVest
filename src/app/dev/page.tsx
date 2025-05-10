"use client";

import { useAccountProviderContext } from "@/contexts/AccountContext";
import { useWallets } from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import {
  parseUnits,
  encodeFunctionData,
  formatUnits,
  createWalletClient,
  custom,
  Hex,
} from "viem";
import { baseSepolia } from "viem/chains";
import { toast } from "react-toastify";
import { useChainId, useReadContract, useSwitchChain } from "wagmi";
import { ERC20_ABI } from "@/constants";
import { hashAuthorization } from "viem/utils";

export const ZERODEV_TOKEN_ADDRESS =
  "0xB763277E5139fB8Ac694Fb9ef14489ec5092750c";
export const ZERODEV_DECIMALS = 6;

const DevPage = () => {
  const { wallets } = useWallets();
  const { embeddedWallet, kernelAccountClient } = useAccountProviderContext();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  console.log(wallets);

  const { data, isLoading } = useReadContract({
    address: ZERODEV_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [embeddedWallet?.address as `0x${string}`],
  });

  const test = async () => {
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom(window.ethereum!),
    });
    const [address] = await walletClient.getAddresses();
    const authorization = await walletClient.prepareAuthorization({
      account: address,
      contractAddress: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
    });

    const signed = await walletClient.signMessage({
      account: address,
      message: hashAuthorization(authorization),
    });

    console.log(signed);

    // await walletClient.signAuthorization({
    //   account: address,
    //   contractAddress: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
    // });
  };

  const {
    mutate: sendTransaction,
    isPending,
    data: txHash,
  } = useMutation({
    mutationKey: [
      "gasSponsorship sendTransaction",
      kernelAccountClient?.account?.address,
    ],
    mutationFn: async () => {
      if (!kernelAccountClient?.account)
        throw new Error("No kernel client found");

      return kernelAccountClient.sendTransaction({
        account: kernelAccountClient.account,
        to: ZERODEV_TOKEN_ADDRESS,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: [
            {
              name: "mint",
              type: "function",
              inputs: [
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
              ],
            },
          ],
          functionName: "mint",
          args: [
            kernelAccountClient.account.address,
            parseUnits("1", ZERODEV_DECIMALS),
          ],
        }),
        chain: baseSepolia,
      });
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Transaction sent successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to send transaction");
    },
  });

  return (
    <div style={{ textAlign: "center" }}>
      <div>{embeddedWallet?.address}</div>
      <button onClick={() => sendTransaction()}>Send Transaction</button>
      {isPending && <div>Pending...</div>}
      {txHash && <div>Transaction hash: {txHash}</div>}

      <button onClick={() => switchChain({ chainId: baseSepolia.id })}>
        Switch Chain
      </button>
      <button onClick={test}>Connect</button>
    </div>
  );
};

export default DevPage;
