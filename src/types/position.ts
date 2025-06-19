import { SupportedChainIds } from "@/providers/config";
import type { Strategy } from "./strategies";

export type Position = {
  id: string;
  createAt: string;
  strategy: Strategy;
  tokenName: string;
  amount: number;
  chainId: SupportedChainIds;
  status: string;
};
