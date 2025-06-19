import { useState } from "react";
import { ArrowLeft, Check, Search } from "lucide-react";
import Image from "next/image";
import { useChainId } from "wagmi";

import { Token } from "@/types";
import { SUPPORTED_TOKENS } from "@/constants/profile";
import { wagmiConfig } from "@/providers/config";

interface AssetSelectViewProps {
  selectedAsset?: Token;
  onAssetSelect: (asset: Token) => void;
  onBack: () => void;
  title?: string;
}

export function AssetSelectView({
  selectedAsset,
  onAssetSelect,
  onBack,
  title = "Select Asset",
}: AssetSelectViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const chainId = useChainId<typeof wagmiConfig>();

  const availableTokens = SUPPORTED_TOKENS[chainId];

  const filteredTokens = availableTokens.filter((token) =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssetSelect = (asset: Token) => {
    onAssetSelect(asset);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-6 h-6"
        >
          <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
        </button>
        <h2 className="font-[Manrope] font-semibold text-[22px] leading-[1.27] text-[#404040]">
          {title}
        </h2>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 p-3 px-4 border border-[rgba(43,49,69,0.2)] rounded-2xl">
        <Search />
        <input
          type="text"
          placeholder="Search network"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-[14px] leading-[1.64] text-center text-[rgba(43,49,69,0.6)] placeholder:text-[rgba(43,49,69,0.6)] outline-none"
        />
      </div>

      {/* Assets list */}
      <div className="flex flex-col">
        {filteredTokens.map((token) => {
          const isSelected = selectedAsset?.name === token.name;
          return (
            <button
              key={token.name}
              onClick={() => handleAssetSelect(token)}
              className={`flex items-center justify-between gap-2 p-3 px-4 rounded-xl transition-colors ${
                isSelected ? "bg-[#F8F9FE]" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Token icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50">
                  <Image
                    src={token.icon}
                    alt={token.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>

                {/* Token name */}
                <div className="flex flex-col flex-1">
                  <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A] text-left">
                    {token.name}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              <div className="flex items-center justify-center w-6 h-6">
                {isSelected ? (
                  <div className="w-5 h-5 bg-[#5F79F1] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-[#1A1A1A] rounded-full"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
