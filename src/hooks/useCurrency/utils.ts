import axios from "axios";

import { COINGECKO_IDS, getTokenNameByCoingeckoId } from "@/constants/coins";
import { Token } from "@/types";

export async function fetchTokenPrice(token: Token) {
  const id = COINGECKO_IDS[token.name];

  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: id,
        vs_currencies: "usd",
      },
    }
  );

  const price = Number(response.data[id]?.usd);
  return price;
}

type TokenPriceResponse = {
  [key: string]: {
    usd: number;
  };
};

export async function fetchTokensPrices(tokens: Token[]) {
  const ids = tokens.map((t) => COINGECKO_IDS[t.name]);

  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: ids.join(","),
        vs_currencies: "usd",
      },
    }
  );

  const prices = response.data as TokenPriceResponse;

  const res = Object.entries(prices).reduce((acc, [id, price]) => {
    acc[getTokenNameByCoingeckoId(id)] = price.usd;
    return acc;
  }, {} as Record<string, number>);

  return res;
}
