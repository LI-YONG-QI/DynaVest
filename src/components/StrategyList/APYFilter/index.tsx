import Image from "next/image";
import { useEffect } from "react";

// APY sort options
const apySortOptions = [
  {
    value: "high-to-low",
    label: "High to Low",
  },
  {
    value: "low-to-high",
    label: "Low to High",
  },
];

export default function APYFilter({
  selectedApySort,
  setSelectedApySort,
  showApyDropdown,
  setShowApyDropdown,
  dropdownRef,
}: {
  selectedApySort: string | null;
  setSelectedApySort: (sort: string | null) => void;
  showApyDropdown: boolean;
  setShowApyDropdown: (value: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowApyDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, setShowApyDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-2 px-4 py-2.5 ${
          selectedApySort ? "bg-[#E2E8F7]" : "bg-[#F8F9FE]"
        } rounded-lg`}
        onClick={() => setShowApyDropdown(!showApyDropdown)}
      >
        <span className="font-[family-name:var(--font-inter)] font-medium text-sm text-[#121212]">
          APY
        </span>
        <Image
          src={showApyDropdown ? "/caret-up.svg" : "/caret-down.svg"}
          alt={showApyDropdown ? "Caret up" : "Caret down"}
          width={16}
          height={16}
        />
      </button>

      {showApyDropdown && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-3">
            <div className="mb-2 font-medium text-sm text-gray-700">
              Sort by APY
            </div>
            <div className="space-y-1">
              {apySortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded hover:bg-gray-50 ${
                    selectedApySort === option.value
                      ? "bg-[#F0F4FF] text-[#5F79F1]"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedApySort(option.value);
                    setShowApyDropdown(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSelectedApySort(null);
                  setShowApyDropdown(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
