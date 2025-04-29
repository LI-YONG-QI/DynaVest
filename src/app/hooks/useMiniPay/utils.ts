import { celoAlfajores } from "viem/chains";

import { createWalletClient, custom } from "viem";

export const getUserAddress = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    const walletClient = createWalletClient({
      transport: custom(window.ethereum!),
      chain: celoAlfajores,
    });

    const [address] = await walletClient.getAddresses();

    return address;
  }
};
