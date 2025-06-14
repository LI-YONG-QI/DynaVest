"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import { STRATEGIES_METADATA } from "@/constants/strategies";
import { StrategyDetailsChart } from "@/components/StrategyList/StrategyDetailsChart";
import {
  InvestmentFormMode,
  StrategyDetailsChartToggleOption,
} from "@/types/strategies";
import { StrategyDetailsTradeTable } from "@/components/StrategyDetailsTradeTable";
import InvestmentForm from "@/components/StrategyList/StrategyCard/InvestModal/InvestmentForm";
import { Home, ChartLine, FileChartColumn } from "lucide-react";

function getRiskLevelLabel(level: string) {
  switch (level) {
    case "low":
      return "Low Risk";
    case "medium":
      return "Medium Risk";
    case "high":
      return "High Risk";
    default:
      return "Unknown Risk";
  }
}

function StrategyDetailContent() {
  const { openChat } = useChat();
  const params = useParams();
  const [activeToggle, setActiveToggle] =
    useState<StrategyDetailsChartToggleOption>("APY");
  // const [mode, setMode] = useState<InvestmentFormMode>("invest");
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // Find the strategy that matches the normalized title
  const strategy = STRATEGIES_METADATA.find((s) => s.id.toLowerCase() === id);

  if (!strategy) {
    notFound();
  }

  return (
    <div className="relative">
      {/* List */}
      <div className="hidden lg:block fixed left-12 top-1/2 -translate-y-1/2 z-10 group/nav">
        <div className="bg-white rounded-xl shadow-lg p-2 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: Home },
            { id: "chart", label: "Chart", icon: ChartLine },
            { id: "trades", label: "Trades", icon: FileChartColumn },
          ].map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => {
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="relative flex items-center h-10 w-10 group-hover/nav:w-32 px-2 rounded-xl hover:bg-[#5F79F1]/10 hover:text-[#5F79F1] transition-all duration-200 overflow-hidden group/item"
                aria-label={item.label}
              >
                <div className="flex items-center min-w-0">
                  <item.icon className="size-5 flex-shrink-0 text-gray-500 transition-colors duration-200 group-hover/item:text-[#5F79F1]" />
                  <span className="ml-2 group-hover/item:text-[#5F79F1] text-sm text-gray-700 whitespace-nowrap transition-all duration-200 transform -translate-x-4 opacity-0 group-hover/nav:translate-x-0 group-hover/nav:opacity-100 w-0 group-hover/nav:w-auto">
                    {item.label}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link href="/strategies" className="flex items-center gap-2">
          <span className="text-xs">&lt;</span>
          Back to strategies
        </Link>

        <button
          onClick={() => openChat()}
          className="bg-[#5F79F1] text-xs md:text-sm flex items-center gap-x-2 text-white px-5 py-3 rounded-2xl shadow-[0px_21px_27px_-10px_rgba(71,114,234,0.65)] font-[family-name:var(--font-manrope)] font-medium hover:bg-[#4A64DC] transition-colors"
        >
          <span>
            <Image
              src="/bot-icon-white.svg"
              alt="Bot"
              width={20}
              height={20}
              className="text-[#1E3498]"
            />
          </span>
          Ask DynaVest Bot
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 mt-10">
        {/* Left - Strategy Details and Statistics */}
        <div className="xl:col-span-8">
          {/* Strategy Name and Details */}
          <div id="overview" className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={`/crypto-icons/chains/${strategy.chainId}.svg`}
                alt="Strategy Icon"
                width={40}
                height={40}
              />
              <h2 className="text-4xl font-semibold">{strategy.title}</h2>
              <span
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: strategy.risk?.bgColor || "#E5E7EB",
                  color: strategy.risk?.color || "#6B7280",
                }}
              >
                {getRiskLevelLabel(strategy.risk?.level)}
              </span>
            </div>
            <div className="flex flex-col items-start self-stretch flex-grow md:pr-20">
              <p className="text-[#17181C] text-sm font-normal text-left">
                {strategy.description}
                {strategy.learnMoreLink && (
                  <Link
                    href={strategy.learnMoreLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3568E8] hover:underline ml-1"
                  >
                    Learn More
                  </Link>
                )}
              </p>
            </div>

            <div className="mt-5">
              <div className="bg-white rounded-lg p-1 md:p-2">
                <div className="grid grid-cols-1 md:grid-cols-5 max-md:divide-y-2 md:divide-x-2 divide-gray-200">
                  <div className="md:px-4 py-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      Protocol
                    </div>
                    <div className="font-medium mt-1 flex gap-1 items-center">
                      <span>{strategy.protocol}</span>
                      {strategy.externalLink && (
                        <Link
                          href={strategy.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3568E8] hover:underline"
                        >
                          <Image
                            src="/external-link.svg"
                            alt="External Link"
                            width={20}
                            height={20}
                          />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="md:px-4 py-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      Token
                    </div>
                    <div className="max-sm:text-xs font-medium mt-1">
                      {strategy.tokens.map((token) => (
                        <div
                          key={token.name}
                          className="flex items-center gap-1"
                        >
                          <span className="relative size-5">
                            <Image
                              src={`/crypto-icons/${token.name.toLowerCase()}.svg`}
                              alt={token.name}
                              fill
                              className="object-contain"
                            />
                          </span>
                          <span>{token.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:px-4 py-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      TVL
                    </div>
                    <div className="font-medium mt-1">$130,478</div>
                  </div>
                  <div className="md:px-4 py-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      APY
                    </div>
                    <div className="max-sm:text-xs font-medium mt-1">
                      {strategy.apy}%
                    </div>
                  </div>
                  <div className="md:px-4 py-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      Daily
                    </div>
                    <div className="max-sm:text-xs font-medium mt-1">
                      0.0555%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="chart" className="relative mt-5">
            <div className="bg-white rounded-lg divide-y-2 divide-gray-200">
              <div className="p-5 flex items-center">
                <h2 className="text-2xl font-bold">Charts</h2>
                <div className="flex ml-auto">
                  <div className="inline-flex bg-[#5F79F1]/10 rounded-lg p-1">
                    {(
                      [
                        "APY",
                        "TVL",
                        "PRICE",
                      ] as StrategyDetailsChartToggleOption[]
                    ).map((option) => (
                      <button
                        key={option}
                        onClick={() => setActiveToggle(option)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          activeToggle === option
                            ? "bg-[#5F79F1] text-white"
                            : "text-black hover:bg-[#5F79F1]/20"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative py-5 px-2">
                <StrategyDetailsChart />
              </div>

              {/* Mask */}
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
                <div className="backdrop-blur bg-black/40 rounded-2xl shadow-2xl p-8 w-full h-full m-4 flex items-center justify-center">
                  <span className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">
                    will release in the future
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div id="trades" className="relative mt-5">
            <div className="bg-white rounded-lg divide-y-2 divide-gray-200">
              <div className="p-5 flex items-center">
                <h2 className="text-2xl font-bold">Trades</h2>
              </div>
              <div className="p-5">
                <StrategyDetailsTradeTable />
              </div>
            </div>

            {/* Mask */}
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
              <div className="backdrop-blur bg-black/40 rounded-2xl shadow-2xl p-8 w-full h-full m-4 flex items-center justify-center">
                <span className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">
                  will release in the future
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Invest/Withdraw Modal */}
        <div className="xl:col-span-4 mb-6 xl:mb-0">
          <div className="bg-white shadow-[0px_21px_27px_-10px_rgba(71,114,234,0.65)] rounded-lg">
            <div className="divide-y-2 divide-gray-200">
              {/* <div className="flex items-stretch gap-0.5 mb-5">
                <button
                  onClick={() => setMode("invest")}
                  className={`flex-1 py-3.5 px-5 rounded-tl-lg text-sm font-medium transition-colors ${
                    mode === "invest"
                      ? "bg-[#5F79F1] text-white shadow-sm"
                      : "text-[#5F79F1] hover:bg-[#5F79F1]/20"
                  }`}
                >
                  Invest
                </button>
                <button
                  onClick={() => setMode("withdraw")}
                  className={`flex-1 py-3.5 px-5 rounded-tr-lg text-sm font-medium transition-colors ${
                    mode === "withdraw"
                      ? "bg-[#5F79F1] text-white shadow-sm"
                      : "text-[#5F79F1] hover:bg-[#5F79F1]/20"
                  }`}
                >
                  Withdraw
                </button>
              </div> */}
              <div className="p-5">
                <InvestmentForm strategy={strategy} mode={mode} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 遮罩層 */}
      {/* <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
          <div className="backdrop-blur bg-black/40 rounded-2xl shadow-2xl p-8 w-full h-full m-8 flex items-center justify-center">
            <span className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">
              will release in the future
            </span>
          </div>
        </div> */}
    </div>
  );
}

export default function StrategyDetailPage() {
  return (
    <div className="relative">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F79F1]"></div>
          </div>
        }
      >
        <StrategyDetailContent />
      </Suspense>
    </div>
  );
}
