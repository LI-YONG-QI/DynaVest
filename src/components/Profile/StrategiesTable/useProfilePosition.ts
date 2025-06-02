import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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

export type Position = {
  id: string;
  strategy: string;
  tokenName: string;
  amount: number;
  chainId: number;
  status: string;
};

const getPositions = async (address: string): Promise<Position[]> => {
  const response = await axios.get<PositionResponse[]>(
    `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${address}`
  );

  return response.data.map((position) => ({
    id: position.position_id,
    strategy: position.strategy,
    tokenName: position.token_name,
    amount: position.amount,
    chainId: position.chain_id,
    status: position.status,
  }));
};

export const useProfilePosition = () => {
  const { client } = useSmartWallets();
  const address = client?.account?.address;

  return useQuery({
    queryKey: ["positions", address],
    queryFn: () => getPositions(address || ""),
    enabled: !!address,
  });
};
