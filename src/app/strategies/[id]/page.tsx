"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import { STRATEGIES_METADATA } from "@/constants/strategies";

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
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // Find the strategy that matches the normalized title
  const strategy = STRATEGIES_METADATA.find((s) => s.id.toLowerCase() === id);

  if (!strategy) {
    notFound();
  }

  return (
    <div>
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link href="/strategies" className="flex items-center gap-2">
          <span className="text-md">&lt;</span>
          Back to strategies
        </Link>

        <button
          onClick={() => openChat()}
          className="bg-[#5F79F1] flex items-center gap-x-2 text-white px-5 py-3 rounded-2xl shadow-[0px_21px_27px_-10px_rgba(71,114,234,0.65)] font-[family-name:var(--font-manrope)] font-medium hover:bg-[#4A64DC] transition-colors z-10"
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-10">
        {/* Left - Strategy Details and Statistics */}
        <div className="md:col-span-9">
          {/* Strategy Name and Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={`/crypto-icons/chains/${strategy.chainId}.svg`}
                alt="Strategy Icon"
                width={40}
                height={40}
              />
              <h2 className="text-4xl">{strategy.title}</h2>
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
            <div className="flex flex-col items-start self-stretch flex-grow pr-10">
              <p className="font-[family-name:var(--font-inter)] text-[#17181C] text-sm font-normal text-left ">
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
          </div>
        </div>
        {/* Right - Actions */}
        <div className="md:col-span-3">{/* TODO */}</div>
      </div>
    </div>
  );
}

export default function StrategyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F79F1]"></div>
        </div>
      }
    >
      <StrategyDetailContent />
    </Suspense>
  );
}
