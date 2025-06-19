import { useMemo } from "react";
import { useChainId } from "wagmi";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";

import type { Position } from "@/types/position";
import { getProfit } from "@/components/Profile/StrategiesTable/useProfit";

export const useProfits = (positions: Position[]) => {
  const { client } = useSmartWallets();
  const chainId = useChainId();

  const user = useMemo(() => {
    return client?.account?.address || null;
  }, [client?.account?.address]);

  async function getProfits() {
    const activePositions = positions.filter(
      (position) => position.status === "true"
    );
    const profits = await Promise.all(
      activePositions.map((position) => getProfit(user!, chainId, position))
    );
    return profits;
  }

  return useQuery({
    queryKey: [
      "profits",
      user,
      chainId,
      positions.map((p) => p.strategy).join(","),
    ],
    queryFn: getProfits,
    enabled: !!client && !!user,
    staleTime: 30 * 1000,
    throwOnError: (error) => {
      console.error("ProfitsQuery", error);
      return false;
    },
  });
};
