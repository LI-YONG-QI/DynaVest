import { getStrategy } from "@/utils/strategies";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useChainId } from "wagmi";

import { convertStrategyName } from "./utils";
import type { Position } from "./useProfilePosition";
import { getTokenByName } from "@/constants/coins";

export const useProfit = (position: Position) => {
  const { client } = useSmartWallets();
  const chainId = useChainId();

  const token = getTokenByName(position.tokenName);

  const user = useMemo(() => {
    return client?.account?.address || null;
  }, [client?.account?.address]);

  async function getProfit() {
    const strategy = getStrategy(
      convertStrategyName(position.strategy),
      chainId
    );

    return strategy.getProfit({
      user,
      amount: BigInt(position.amount),
      underlyingAsset: token.chains?.[chainId],
    });
  }

  return useQuery({
    queryKey: ["profit", user, chainId, position.strategy],
    queryFn: getProfit,
    enabled: !!client && !!user,
    staleTime: 30 * 1000,
  });
};
