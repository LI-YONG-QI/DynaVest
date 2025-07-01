import React from "react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// APY sort options
const apySortOptions = [
  { value: "high-to-low", label: "High to Low" },
  { value: "low-to-high", label: "Low to High" },
];

export default function APYFilter({
  selectedApySort,
  setSelectedApySort,
  showApyDropdown,
  setShowApyDropdown,
}: {
  selectedApySort: string | null;
  setSelectedApySort: (sort: string | null) => void;
  showApyDropdown: boolean;
  setShowApyDropdown: (value: boolean) => void;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <DropdownMenu
      open={showApyDropdown}
      onOpenChange={setShowApyDropdown}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 ${
            selectedApySort ? "bg-[#E2E8F7]" : "bg-[#F8F9FE]"
          } rounded-lg`}
        >
          <span className="font-[family-name:var(--font-inter)] font-medium text-sm text-[#121212]">
            APY
          </span>
          <Image
            src="/caret-down.svg"
            alt="Caret down"
            width={16}
            height={16}
            className={`transition-transform ${
              showApyDropdown ? "rotate-180" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Sort by APY</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedApySort ?? ""}
          onValueChange={(value) => {
            setSelectedApySort(value);
          }}
        >
          {apySortOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => setSelectedApySort(null)}
          className="cursor-pointer"
        >
          Clear
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
