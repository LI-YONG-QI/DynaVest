import { Protocol } from "@/types";
import { PERMIT_EXPIRY } from "@/constants";
import { AaveV3Strategy } from "./aave";
import { BaseStrategy } from "./base";
import { AnkrFlowStrategy } from "./ankrFlow";
import { FlowStrategy } from "./flow";
import { KittyStrategy } from "./kitty";
import { StCeloStrategy } from "./stCelo";
import { MorphoSupplyingStrategy } from "./morpho";
import { UniswapV3Strategy } from "./uniswap";
import { BscAaveV3Strategy } from "./bsc";
import { LSTStrategy } from "./lst";
import { BscLstStrategy } from "./bscLst";
import { CamelotStrategy } from "./camelot";
import { GMXStrategy } from "./gmx";
import { MorphoAA } from "./morphoAA";

export function getDeadline(): bigint {
  const timestampInSeconds = Math.floor(Date.now() / 1000);
  return BigInt(timestampInSeconds) + BigInt(PERMIT_EXPIRY);
}

export function getStrategy(
  protocol: Protocol,
  chainId: number
): BaseStrategy<number> {
  // The type casting here is safe because we've already verified the chainId is supported
  // for the specific protocol with isChainIdSupported
  switch (protocol) {
    case "AAVE":
      return new AaveV3Strategy(chainId);
    case "stCelo":
      return new StCeloStrategy(chainId);
    case "ankrFlow":
      return new AnkrFlowStrategy(chainId);
    case "Kitty":
      return new KittyStrategy(chainId);
    case "Flow":
      return new FlowStrategy(chainId);
    case "Morpho":
      return new MorphoSupplyingStrategy(chainId);
    case "Uniswap":
      return new UniswapV3Strategy(chainId);
    case "BSC Aave":
      return new BscAaveV3Strategy(chainId);
    case "LST":
      return new LSTStrategy(chainId);
    case "BSC LST":
      return new BscLstStrategy(chainId);
    case "Camelot":
      return new CamelotStrategy(chainId);
    case "GMX":
      return new GMXStrategy(chainId);
    case "MorphoAA":
      return new MorphoAA(chainId);
    default:
      throw new Error("Unsupported protocol");
  }
}
