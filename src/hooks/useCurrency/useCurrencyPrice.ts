import { useQuery } from "@tanstack/react-query";
import { Token } from "@/types";

import { fetchTokenPrice } from "./utils";

export function useCurrencyPrice(token: Token) {
  return useQuery({
    queryKey: ["tokenPrice", token],
    queryFn: () => fetchTokenPrice(token),
    staleTime: 2 * 60 * 1000, // Consider data stale after 30 seconds
    placeholderData: 0,
  });
}
