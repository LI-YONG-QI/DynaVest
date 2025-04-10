export * from "./aave";

import { StCeloSupportedChains } from "../constants/protocols/stCelo";
import { AnkrSupportedChains } from "../constants/protocols/ankr";
import { KittySupportedChains } from "../constants/protocols/kitty";
import { flowMainnet } from "viem/chains";
import {
  AaveSupportedChains,
  AAVE_CONTRACTS,
} from "../constants/protocols/aave";
import { ST_CELO_CONTRACTS } from "../constants/protocols/stCelo";
import { ANKR_CONTRACTS } from "../constants/protocols/ankr";
import { KITTY_CONTRACTS } from "../constants/protocols/kitty";

import { AaveV3Strategy } from "./aave";
import { AnkrFlowStrategy } from "./ankrFlow";
import { FlowStrategy } from "./flow";
import { KittyStrategy } from "./kitty";
import { StCeloStrategy } from "./stCelo";

// Helper function to validate if chainId is supported for a specific protocol
function isChainIdSupported(protocol: string, chainId: number): boolean {
  switch (protocol) {
    case "AAVE":
      // Check if the chainId exists as a key in AAVE_CONTRACTS
      return Object.keys(AAVE_CONTRACTS).map(Number).includes(chainId);
    case "stCelo":
      return Object.keys(ST_CELO_CONTRACTS).map(Number).includes(chainId);
    case "ankrFlow":
      return Object.keys(ANKR_CONTRACTS).map(Number).includes(chainId);
    case "Kitty":
      return Object.keys(KITTY_CONTRACTS).map(Number).includes(chainId);
    case "Flow":
      return chainId === flowMainnet.id; // Flow only supports flowMainnet for now
    default:
      return false;
  }
}

export function getStrategy(protocol: string, chainId: number) {
  // Check if the chainId is supported for the requested protocol
  if (!isChainIdSupported(protocol, chainId)) {
    throw new Error(`Unsupported chain ID ${chainId} for protocol ${protocol}`);
  }

  switch (protocol) {
    case "AAVE":
      return new AaveV3Strategy(chainId as AaveSupportedChains);
    case "stCelo":
      return new StCeloStrategy(chainId as StCeloSupportedChains);
    case "ankrFlow":
      return new AnkrFlowStrategy(chainId as AnkrSupportedChains);
    case "Kitty":
      return new KittyStrategy(chainId as KittySupportedChains);
    case "Flow":
      return new FlowStrategy(chainId);
    default:
      throw new Error("Unsupported protocol");
  }
}
