import { type SmartWallet } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";

export const useDeploySmartWallet = () => {
  const { client } = useSmartWallets();

  return useMutation({
    mutationFn: async (smartWallet: SmartWallet) => {
      if (client?.account.isDeployed()) {
        const tx = await client.sendTransaction(
          {
            to: smartWallet.address as Address, // 自身地址即可
            value: BigInt(0), // 零 ETH
            data: "0x",
          },
          {
            uiOptions: {
              showWalletUIs: false,
            },
          }
        );

        return tx;
      }
    },
  });
};
