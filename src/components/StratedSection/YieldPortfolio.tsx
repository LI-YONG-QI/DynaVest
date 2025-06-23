import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, CircleCheckBig } from "lucide-react";

const YieldPortfolio = ({
  handleMessage,
}: {
  handleMessage: (userInput: string) => Promise<void>;
}) => {
  const [isDone, setIsDone] = useState(false);

  const handleClick = async () => {
    setIsDone(true);

    await handleMessage("Build a diversified DeFi Portfolio");
  };

  return (
    <div
      onClick={handleClick}
      className={`flex-1 border border-[#5F79F1] rounded-[11px] px-[20px] py-[10px] relative ${
        isDone ? "bg-[#5F79F1] text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex flex-col gap-2 pr-12">
        <span className="font-[Manrope] font-semibold text-xs">Step 2</span>
        <span className="font-[Manrope] font-semibold text-base">
          Run a Cross-Chain, Multi-Protocols Yield Portfolio
        </span>
        {/* Chain Icons */}
        <div className="flex items-center gap-1 mt-2">
          {/* Base Chain */}
          <div className="w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center">
            <Image
              src="/crypto-icons/chains/8453.svg"
              alt="Base"
              width={29}
              height={29}
            />
          </div>
          {/* BNB Chain */}
          <div className="w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center">
            <Image
              src="/crypto-icons/bnb.svg"
              alt="BNB"
              width={29}
              height={29}
            />
          </div>
          {/* Arbitrum */}
          <div className="w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center">
            <Image
              src="/crypto-icons/chains/42161.svg"
              alt="Arbitrum"
              width={29}
              height={29}
            />
          </div>
          {/* Flow */}
          <div className="w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center">
            <Image
              src="/crypto-icons/chains/747.svg"
              alt="Flow"
              width={29}
              height={29}
            />
          </div>
          {/* Sonic */}
          <div className="w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center">
            <Image
              src="/crypto-icons/sonic.svg"
              alt="Sonic"
              width={29}
              height={29}
            />
          </div>
          {/* Polygon */}
          <div className="w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center">
            <Image
              src="/crypto-icons/chains/137.svg"
              alt="Polygon"
              width={29}
              height={29}
            />
          </div>
        </div>
      </div>
      {/* Arrow Icon */}
      <div className="absolute top-2 right-5">
        {isDone ? (
          <CircleCheckBig className="w-[24px] h-[24px] text-white" />
        ) : (
          <ArrowUpRight className="w-[24px] h-[24px] text-black" />
        )}
      </div>
    </div>
  );
};

export default YieldPortfolio;
