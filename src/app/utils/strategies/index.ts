export * from "./aave";

import type { AaveSupportedChains } from "./aave";
import { AaveV3Strategy } from "./aave";
import { AnkrFlowStrategy } from "./ankrFlow";
import { FlowStrategy } from "./flow";
import { KittyStrategy } from "./kitty";
import { StCeloStrategy } from "./stCelo";

export function getStrategy(protocol: string, chainId: number) {
  switch (protocol) {
    case "AAVE":
      // TODO: can't infer type of chainId
      return new AaveV3Strategy(chainId as AaveSupportedChains);
    case "stCelo":
      return new StCeloStrategy(chainId);
    case "ankrFlow":
      return new AnkrFlowStrategy(chainId);
    case "Kitty":
      return new KittyStrategy(chainId);
    case "Flow":
      return new FlowStrategy(chainId);
    default:
      throw new Error("Unsupported protocol");
  }
}
