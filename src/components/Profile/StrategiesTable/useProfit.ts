import { getStrategy } from "@/utils/strategies";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import type { Address } from "viem";

import type { Position } from "@/types/position";
import { Protocol } from "@/types";

export async function getProfit(
  user: Address,
  chainId: number,
  position: Position
) {
  const strategy = getStrategy(position.strategy as Protocol, chainId);
  return strategy.getProfit(user, position);
}

export const useProfit = (position: Position) => {
  const { client } = useSmartWallets();
  const chainId = useChainId();

  const user = useMemo(() => {
    return client?.account?.address || null;
  }, [client?.account?.address]);

  return useQuery({
    queryKey: ["profit", user, chainId, position],
    queryFn: () => getProfit(user!, chainId, position),
    enabled: !!client && !!user,
    staleTime: 30 * 1000,
  });
};
