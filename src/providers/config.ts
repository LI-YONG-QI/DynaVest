import { createConfig } from "@privy-io/wagmi";
import {
  celo,
  flowMainnet,
  base,
  bsc,
  arbitrum,
  polygon,
  baseSepolia,
} from "viem/chains";
import { http } from "wagmi";

export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

export const wagmiConfig = createConfig({
  chains: [arbitrum, celo, base, flowMainnet, bsc, polygon, baseSepolia],
  transports: {
    [celo.id]: http(`https://celo-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [flowMainnet.id]: http(
      `https://flow-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    ),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [bsc.id]: http(`https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [arbitrum.id]: http(
      `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    ),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    ),
    [baseSepolia.id]: http(),
  },
});
