import Image from "next/image";
import { useEffect } from "react";

import { RISK_OPTIONS } from "@/constants/risk";
import { getRiskColor } from "@/utils";

// Risk level options with colors

export default function RiskFilter({
  selectedRisks,
  setSelectedRisks,
  toggleRiskSelection,
  showRiskDropdown,
  setShowRiskDropdown,
  dropdownRef,
}: {
  selectedRisks: string[];
  setSelectedRisks: (risks: string[]) => void;
  toggleRiskSelection: (risk: string) => void;
  showRiskDropdown: boolean;
  setShowRiskDropdown: (value: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowRiskDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, setShowRiskDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-2 px-4 py-2.5 ${
          selectedRisks.length > 0 ? "bg-[#E2E8F7]" : "bg-[#F8F9FE]"
        } rounded-lg`}
        onClick={() => setShowRiskDropdown(!showRiskDropdown)}
      >
        <span className="font-[family-name:var(--font-inter)] font-medium text-sm text-[#121212]">
          {selectedRisks.length > 0 ? `Risk (${selectedRisks.length})` : "Risk"}
        </span>
        <Image
          src={showRiskDropdown ? "/caret-up.svg" : "/caret-down.svg"}
          alt={showRiskDropdown ? "Caret up" : "Caret down"}
          width={16}
          height={16}
        />
      </button>

      {showRiskDropdown && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-3">
            <div className="mb-2 font-medium text-sm text-gray-700">
              Filter by Risk Level
            </div>
            <div className="space-y-2">
              {RISK_OPTIONS.map((risk, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <label className="flex items-center cursor-pointer w-full">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedRisks.includes(risk)}
                      onChange={() => toggleRiskSelection(risk)}
                    />
                    <div
                      className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
                        selectedRisks.includes(risk)
                          ? "bg-[#5F79F1] border-[#5F79F1]"
                          : "border border-gray-300 bg-white"
                      }`}
                    >
                      {selectedRisks.includes(risk) && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 1L3.5 6.5L1 4"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm capitalize">{risk}</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRiskColor(risk).bg }}
                      ></div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedRisks([])}
              >
                Clear all
              </button>
              <button
                className="text-xs text-[#5F79F1] font-medium hover:text-[#4A64DC]"
                onClick={() => setShowRiskDropdown(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
