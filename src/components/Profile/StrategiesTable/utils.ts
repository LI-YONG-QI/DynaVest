/**
 * @deprecated unified strategy name (Aave V3 Supply = AaveV3Supply)
 */
export function convertStrategyName(strategy: string) {
  switch (strategy) {
    case "Aave V3 Supply":
      return "AaveV3Supply";
    case "Morpho Supply":
      return "MorphoSupply";
    case "Camelot Staking":
      return "CamelotStaking";
    case "StakedCelo Staking":
      return "StCeloStaking";
    case "GMX Deposit":
    default:
      throw new Error(`Strategy ${strategy} not found`);
  }
}
