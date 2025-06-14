import React, { useMemo } from "react";

import { RiskLevel, StrategyMetadata } from "@/types";
import { STRATEGIES_METADATA } from "@/constants/strategies";
import StrategyCard from "../../StrategyList/StrategyCard";

interface StrategyListChatWrapperProps {
  selectedRiskLevel: RiskLevel;
  selectedChains: number[];
}

const StrategyListChatWrapper = ({
  selectedChains,
  selectedRiskLevel,
}: StrategyListChatWrapperProps) => {
  const filteredStrategies = useMemo(() => {
    let filtered = STRATEGIES_METADATA;

    if (selectedRiskLevel.length > 0) {
      filtered = filtered.filter((strategy) =>
        selectedRiskLevel.includes(strategy.risk)
      );
    }

    if (selectedChains.length > 0) {
      filtered = filtered.filter((strategy) =>
        selectedChains.includes(strategy.chainId)
      );
    }

    return filtered;
  }, [selectedRiskLevel, selectedChains]);

  return (
    <>
      {filteredStrategies.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-7">
          {filteredStrategies.map(
            (strategy: StrategyMetadata, index: number) => (
              <StrategyCard key={index} {...strategy} />
            )
          )}
        </div>
      ) : null}
    </>
  );
};

export default StrategyListChatWrapper;
