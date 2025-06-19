import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Position } from "@/types/position";
import { Strategy } from "@/types/strategies";
import { SupportedChainIds } from "@/providers/config";

type PositionResponse = {
  position_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  amount: number;
  token_name: string;
  chain_id: number;
  strategy: string;
  status: string;
};

const getPositions = async (address: string): Promise<Position[]> => {
  const response = await axios.get<PositionResponse[]>(
    `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${address}`
  );

  return response.data.map((position) => ({
    id: position.position_id,
    createAt: position.created_at,
    strategy: position.strategy as Strategy,
    tokenName: position.token_name,
    amount: position.amount,
    chainId: position.chain_id as SupportedChainIds,
    status: position.status,
  }));
};

export const usePositions = () => {
  const { client } = useSmartWallets();
  const address = client?.account?.address;

  return useQuery({
    queryKey: ["positions", address],
    queryFn: () => getPositions(address || ""),
    enabled: !!address,
    throwOnError: (error) => {
      console.error("PositionsQuery", error);
      return false;
    },
  });
};
