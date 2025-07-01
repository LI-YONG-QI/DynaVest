import React from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RISK_OPTIONS } from "@/constants/risk";
import { getRiskColor } from "@/utils";

export default function RiskFilter({
  selectedRisks,
  setSelectedRisks,
  toggleRiskSelection,
  showRiskDropdown,
  setShowRiskDropdown,
}: {
  selectedRisks: string[];
  setSelectedRisks: (risks: string[]) => void;
  toggleRiskSelection: (risk: string) => void;
  showRiskDropdown: boolean;
  setShowRiskDropdown: (value: boolean) => void;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <DropdownMenu
      open={showRiskDropdown}
      onOpenChange={setShowRiskDropdown}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 ${
            selectedRisks.length > 0 ? "bg-[#E2E8F7]" : "bg-[#F8F9FE]"
          } rounded-lg`}
        >
          <span className="font-[family-name:var(--font-inter)] font-medium text-sm text-[#121212]">
            {selectedRisks.length > 0
              ? `Risk (${selectedRisks.length})`
              : "Risk"}
          </span>
          <Image
            src="/caret-down.svg"
            alt="Caret down"
            width={16}
            height={16}
            className={`transition-transform ${
              showRiskDropdown ? "rotate-180" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <div className="p-3 pb-0">
          <div className="mb-2 font-medium text-sm text-gray-700">
            Filter by Risk Level
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto px-1">
          {RISK_OPTIONS.map((risk) => (
            <DropdownMenuCheckboxItem
              key={risk}
              className="cursor-pointer capitalize"
              checked={selectedRisks.includes(risk)}
              onCheckedChange={() => toggleRiskSelection(risk)}
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm capitalize">{risk}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getRiskColor(risk).bg }}
                ></div>
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="flex justify-between items-center p-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedRisks([])}
          >
            Clear all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#5F79F1] font-medium hover:text-[#4A64DC]"
            onClick={() => setShowRiskDropdown(false)}
          >
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
