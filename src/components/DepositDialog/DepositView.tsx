import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import AddressQRCode from "@/components/AddressQRCode";
import CopyButton from "@/components/CopyButton";
import { Token } from "@/types";

type DepositViewProps = {
  token: Token;
  address: string | undefined;
  chainName: string | undefined;
  onNetworkClick: () => void;
};

export function DepositView({
  token,
  address,
  chainName,
  onNetworkClick,
}: DepositViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-4 pb-6">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center w-6 h-6">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <h2 className="font-[Manrope] font-semibold text-[22px] leading-[1.27] text-[#404040]">
            Deposit {token.name}
          </h2>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="flex items-center w-full p-2 px-4 bg-[#FFF2E7] border border-[#FA8F42] rounded">
        <div className="flex items-center pr-3 pl-0 py-[7px]">
          <Info className="w-6 h-6 text-[#FA8F42]" />
        </div>
        <p className="font-[Manrope] font-bold text-[14px] leading-[1.43] tracking-[0.71%] text-[#121312]">
          Make sure to send funds only on {chainName}
        </p>
      </div>

      {/* QR Code Section */}
      <div className="flex items-center gap-2 p-6">
        <div className="relative">
          <div className="w-[220px] h-[220px] p-3 bg-white rounded-lg flex items-center justify-center">
            <AddressQRCode address={address || ""} />
          </div>
          {/* Token Logo overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-[0.8px] border-[#FEFEFE] rounded-full flex items-center justify-center p-1">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src={token.icon}
                alt={token.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info List */}
      <div className="w-full bg-[#FEFEFE] border border-[#E5E5E5] rounded-2xl p-2 px-4">
        <div className="flex flex-col w-full">
          {/* Network Row */}
          <button
            onClick={onNetworkClick}
            className="flex items-center justify-between w-full gap-2 py-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex flex-col justify-center flex-1">
              <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040] text-left">
                Network
              </p>
              <div className="flex items-center w-full gap-1">
                <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A] flex-1 text-left">
                  {chainName || "BNB Smart Chain (BEP20)"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center flex-shrink-0 gap-[10px]">
              <ChevronRight className="w-6 h-6 text-[#1A1A1A]" />
            </div>
          </button>

          {/* Address Row */}
          <div className="flex items-center justify-between w-full gap-2 py-3">
            <div className="flex flex-col justify-center flex-1 gap-4">
              <div className="flex flex-col w-full">
                <p className="font-[Manrope] font-semibold text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                  Address
                </p>
                <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A] break-all">
                  {address || ""}
                </p>
              </div>
            </div>
            <div className="flex items-end justify-center flex-shrink-0 gap-[10px] h-full">
              <CopyButton size={20} text={address || ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
