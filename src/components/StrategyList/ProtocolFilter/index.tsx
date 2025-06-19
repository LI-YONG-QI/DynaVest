import { useEffect } from "react";
import Image from "next/image";

import { Protocol } from "@/types/strategies";

export interface ProtocolFilterProps {
  protocols: Protocol[];
  selectedProtocols: Protocol[];
  setSelectedProtocols: (protocols: Protocol[]) => void;
  toggleProtocolSelection: (protocol: Protocol) => void;
  showProtocolDropdown: boolean;
  setShowProtocolDropdown: (value: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function ProtocolFilter({
  protocols,
  selectedProtocols,
  toggleProtocolSelection,
  showProtocolDropdown,
  setShowProtocolDropdown,
  dropdownRef,
}: ProtocolFilterProps) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProtocolDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, setShowProtocolDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-2 px-4 py-2.5 ${
          selectedProtocols.length > 0 ? "bg-[#E2E8F7]" : "bg-[#F8F9FE]"
        } rounded-lg`}
        onClick={() => setShowProtocolDropdown(!showProtocolDropdown)}
      >
        <span className="font-[family-name:var(--font-inter)] font-medium text-sm text-[#121212]">
          {selectedProtocols.length > 0
            ? `Protocol (${selectedProtocols.length})`
            : "Protocol"}
        </span>
        <Image
          src={showProtocolDropdown ? "/caret-up.svg" : "/caret-down.svg"}
          alt={showProtocolDropdown ? "Caret up" : "Caret down"}
          width={16}
          height={16}
        />
      </button>

      {showProtocolDropdown && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-3">
            <div className="mb-2 font-medium text-sm text-gray-700">
              Filter by Protocol
            </div>
            <div className="space-y-2">
              {protocols.map((protocol, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <label className="flex items-center cursor-pointer w-full">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedProtocols.includes(protocol)}
                      onChange={() => toggleProtocolSelection(protocol)}
                    />
                    <div
                      className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
                        selectedProtocols.includes(protocol)
                          ? "bg-[#5F79F1] border-[#5F79F1]"
                          : "border border-gray-300 bg-white"
                      }`}
                    >
                      {selectedProtocols.includes(protocol) && (
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
                      <span className="text-sm">{protocol.name}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => {
                  // Clear all selected protocols
                  if (selectedProtocols.length > 0) {
                    protocols.forEach((p) => {
                      if (selectedProtocols.includes(p)) {
                        toggleProtocolSelection(p);
                      }
                    });
                  }
                }}
              >
                Clear all
              </button>
              <button
                className="text-xs text-[#5F79F1] font-medium hover:text-[#4A64DC]"
                onClick={() => setShowProtocolDropdown(false)}
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
