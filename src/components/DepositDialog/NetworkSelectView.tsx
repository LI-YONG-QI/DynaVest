import { ArrowLeft, Check, Search } from "lucide-react";
import Image from "next/image";

import { CHAINS } from "@/constants/chains";

type NetworkSelectViewProps = {
  selectedChainId: number;
  searchTerm: string;
  onBack: () => void;
  onNetworkSelect: (chainId: number) => void;
  onSearchChange: (term: string) => void;
};

export function NetworkSelectView({
  selectedChainId,
  searchTerm,
  onBack,
  onNetworkSelect,
  onSearchChange,
}: NetworkSelectViewProps) {
  const filteredChains = CHAINS.filter((chain) =>
    chain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center gap-4 p-4 pb-6 h-[636px]">
      {/* Header */}
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-6 h-6"
          >
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <h2 className="font-[Manrope] font-semibold text-[22px] leading-[1.27] text-[#404040]">
            Select Network
          </h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full border border-[rgba(43,49,69,0.2)] rounded-2xl">
        <div className="flex items-center justify-center gap-[10px] p-[11px] h-[38px]">
          <Search />
          <input
            type="text"
            placeholder="Search network"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="font-[Manrope] font-normal text-[14px] leading-[1.64] text-center text-[rgba(43,49,69,0.6)] bg-transparent border-none outline-none flex-1"
          />
        </div>
      </div>

      {/* Network List */}
      <div className="flex flex-col w-full flex-1 overflow-y-auto">
        {filteredChains.map((chainOption) => (
          <button
            key={chainOption.id}
            onClick={() => onNetworkSelect(chainOption.id)}
            className={`flex items-center justify-between w-full gap-2 p-3 px-4 rounded-xl transition-colors ${
              chainOption.id === selectedChainId
                ? "bg-[#F8F9FE]"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src={chainOption.icon || "/chain-placeholder.svg"}
                  alt={chainOption.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-1">
                <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A] text-left">
                  {chainOption.name}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center w-6 h-6">
              {chainOption.id === selectedChainId ? (
                <div className="w-5 h-5 bg-[#5F79F1] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-[#1A1A1A] rounded-full"></div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
