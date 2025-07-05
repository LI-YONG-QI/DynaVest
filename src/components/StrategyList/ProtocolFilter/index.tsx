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
import type { Protocol } from "@/types/strategies";

export interface ProtocolFilterProps {
  protocols: Protocol[];
  selectedProtocols: Protocol[];
  setSelectedProtocols: (protocols: Protocol[]) => void;
  toggleProtocolSelection: (protocol: Protocol) => void;
  showProtocolDropdown: boolean;
  setShowProtocolDropdown: (value: boolean) => void;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ProtocolFilter({
  protocols,
  selectedProtocols,
  setSelectedProtocols,
  toggleProtocolSelection,
  showProtocolDropdown,
  setShowProtocolDropdown,
}: ProtocolFilterProps) {
  const handleClear = () => {
    setSelectedProtocols([]);
  };

  return (
    <DropdownMenu
      open={showProtocolDropdown}
      onOpenChange={setShowProtocolDropdown}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 ${
            selectedProtocols.length > 0 ? "bg-[#E2E8F7]" : "bg-[#F8F9FE]"
          } rounded-lg`}
        >
          <span className="font-[family-name:var(--font-inter)] font-medium text-sm text-[#121212]">
            {selectedProtocols.length > 0
              ? `Protocol (${selectedProtocols.length})`
              : "Protocol"}
          </span>
          <Image
            src="/caret-down.svg"
            alt="Caret down"
            width={16}
            height={16}
            className={`transition-transform ${
              showProtocolDropdown ? "rotate-180" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <div className="p-3 pb-0">
          <div className="mb-2 font-medium text-sm text-gray-700">
            Filter by Protocol
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto px-1">
          {protocols.map((protocol) => (
            <DropdownMenuCheckboxItem
              key={protocol.name}
              className="cursor-pointer"
              checked={selectedProtocols.some((p) => p.name === protocol.name)}
              onCheckedChange={() => toggleProtocolSelection(protocol)}
              onSelect={(e) => e.preventDefault()}
            >
              {protocol.name}
            </DropdownMenuCheckboxItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="flex justify-between items-center p-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={handleClear}
          >
            Clear all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-[#5F79F1] font-medium hover:text-[#4A64DC]"
            onClick={() => setShowProtocolDropdown(false)}
          >
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
