export * from "./aave";
export * from "./stCelo";
export * from "./ankr";
export * from "./kitty";
export * from "./morpho";
export * from "./dynaVest";
export * from "./camelot";
export * from "./uniswap";
export * from "./gmx";

export const STRATEGIES = [
  "AaveV3Supply",
  "StCeloStaking",
  "MorphoSupply",
  "UniswapV3AddLiquidity",
  "UniswapV3SwapLST",
  "CamelotStaking",
  "GMXDeposit",
  "MultiStrategy",
] as const;
