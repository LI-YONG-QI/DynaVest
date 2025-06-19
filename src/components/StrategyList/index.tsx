import Image from "next/image";
import { useState, useMemo, useRef } from "react";

import StrategyCard from "./StrategyCard";
import GridIcon from "./GridIcon";
import ListIcon from "./ListIcon";
import StrategyTable from "./StrategyTable";
import RiskFilter from "./RiskFilter";
import ProtocolFilter from "./ProtocolFilter";
import ChainFilter from "./ChainFilter";
import APYFilter from "./APYFilter";

import { STRATEGIES_METADATA } from "@/constants/strategies";

// No results placeholder
const NoResultsPlaceholder = () => (
  <div className="flex flex-col items-center justify-center py-16 w-full">
    <h3 className="text-lg font-medium text-gray-600 mb-2">
      No strategies found
    </h3>
    <p className="text-sm text-gray-500">
      Try adjusting your search query or filters
    </p>
  </div>
);

export default function StrategyList() {
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRiskDropdown, setShowRiskDropdown] = useState(false);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [showProtocolDropdown, setShowProtocolDropdown] = useState(false);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<number[]>([]);
  const [showApyDropdown, setShowApyDropdown] = useState(false);
  const [selectedApySort, setSelectedApySort] = useState<string | null>(null);

  const protocolDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const apyDropdownRef = useRef<HTMLDivElement>(null);

  // Extract all distinct protocols
  const protocolOptions = useMemo(() => {
    const protocols = STRATEGIES_METADATA.map((strategy) => strategy.id);
    return Array.from(new Set(protocols));
  }, []);

  // Toggle protocol selection
  const toggleProtocolSelection = (protocol: string) => {
    setSelectedProtocols((prev) =>
      prev.includes(protocol)
        ? prev.filter((p) => p !== protocol)
        : [...prev, protocol]
    );
  };
  // Toggle risk selection
  const toggleRiskSelection = (risk: string) => {
    setSelectedRisks((prev) =>
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  // Filter and sort strategies based on all criteria
  const filteredStrategies = useMemo(() => {
    let filtered = STRATEGIES_METADATA;

    // Filter by risk if any risks are selected
    if (selectedRisks.length > 0) {
      filtered = filtered.filter((strategy) =>
        selectedRisks.includes(strategy.risk)
      );
    }

    // Filter by protocol if any protocols are selected
    if (selectedProtocols.length > 0) {
      filtered = filtered.filter((strategy) =>
        selectedProtocols.includes(strategy.id)
      );
    }

    if (selectedChains.length > 0) {
      filtered = filtered.filter((strategy) =>
        selectedChains.includes(strategy.chainId)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      try {
        const regex = new RegExp(searchQuery, "i");
        filtered = filtered.filter(
          (strategy) =>
            regex.test(strategy.title) ||
            regex.test(strategy.id) ||
            regex.test(strategy.description)
        );
      } catch {
        // If regex is invalid, fall back to simple includes
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (strategy) =>
            strategy.title.toLowerCase().includes(query) ||
            strategy.id.toLowerCase().includes(query) ||
            strategy.description.toLowerCase().includes(query)
        );
      }
    }

    // Sort by APY if selected
    if (selectedApySort) {
      filtered = [...filtered].sort((a, b) => {
        if (selectedApySort === "high-to-low") {
          return b.apy - a.apy;
        } else if (selectedApySort === "low-to-high") {
          return a.apy - b.apy;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    searchQuery,
    selectedRisks,
    selectedProtocols,
    selectedChains,
    selectedApySort,
  ]);

  return (
    <div>
      {/* Filters */}
      {/* TODO: Implement more filters */}
      {/* TODO: Make fitlers dynamic */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        {/* Filters row */}
        <div className="flex items-center gap-2 md:gap-4 w-full">
          <RiskFilter
            selectedRisks={selectedRisks}
            setSelectedRisks={setSelectedRisks}
            toggleRiskSelection={toggleRiskSelection}
            showRiskDropdown={showRiskDropdown}
            setShowRiskDropdown={setShowRiskDropdown}
            dropdownRef={dropdownRef}
          />

          <ProtocolFilter
            protocols={protocolOptions}
            selectedProtocols={selectedProtocols}
            setSelectedProtocols={setSelectedProtocols}
            toggleProtocolSelection={toggleProtocolSelection}
            showProtocolDropdown={showProtocolDropdown}
            setShowProtocolDropdown={setShowProtocolDropdown}
            dropdownRef={protocolDropdownRef}
          />

          <APYFilter
            selectedApySort={selectedApySort}
            setSelectedApySort={setSelectedApySort}
            showApyDropdown={showApyDropdown}
            setShowApyDropdown={setShowApyDropdown}
            dropdownRef={apyDropdownRef}
          />

          {/* Chain Filter - Desktop */}
          <ChainFilter
            selectedChains={selectedChains}
            setSelectedChains={setSelectedChains}
            className="hidden md:flex md:w-auto md:mb-0"
          />
        </div>

        {/* Chain Filter - Mobile */}
        <div className="flex md:hidden w-full">
          <ChainFilter
            selectedChains={selectedChains}
            setSelectedChains={setSelectedChains}
          />
        </div>

        {/* Search bar and view toggle row */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 h-[44px] bg-[#F8F9FE] border border-[#E2E8F7] rounded-lg w-full md:w-[300px]">
            <Image
              src="/search.svg"
              alt="Search"
              width={20}
              height={20}
              className="text-[#4C505B]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search strategies..."
              className="bg-transparent border-none outline-none font-[family-name:var(--font-inter)] font-medium text-sm text-[#AFB8C8] w-full"
            />
          </div>
          <div className="flex border border-[#E2E8F7] px-3 justify-center items-center gap-2 h-[44px] bg-[#F8F9FE] rounded-lg">
            <button
              className={`p-1 rounded hover:bg-gray-100`}
              onClick={() => {
                setView("grid");
              }}
            >
              <GridIcon isActive={view === "grid"} />
            </button>

            <button
              className={`p-1 rounded hover:bg-gray-100`}
              onClick={() => {
                setView("list");
              }}
            >
              <ListIcon isActive={view === "list"} />
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      {view === "grid" && (
        <>
          {filteredStrategies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {filteredStrategies.map((strategy, index) => (
                <StrategyCard key={index} {...strategy} />
              ))}
            </div>
          ) : (
            <NoResultsPlaceholder />
          )}
        </>
      )}

      {view === "list" && (
        <>
          {filteredStrategies.length > 0 ? (
            <StrategyTable strategies={filteredStrategies} />
          ) : (
            <NoResultsPlaceholder />
          )}
        </>
      )}
    </div>
  );
}
