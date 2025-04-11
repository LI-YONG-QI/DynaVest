import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import InvestModal from "./InvestModal";
import { getRiskColor } from "@/app/utils";
import type { Token } from "@/app/utils/types";

interface StrategyCardProps {
  title: string;
  apy: number;
  risk: {
    level: "Low" | "Medium" | "High";
    color: string;
    bgColor: string;
  };
  protocol: string;
  description: string;
  image: string;
  externalLink?: string;
  learnMoreLink?: string;
  tokens: Token[];
  chainId: number;
  displayInsufficientBalance?: boolean;
}

export default function StrategyCard({
  title,
  apy,
  risk,
  protocol,
  description,
  image,
  externalLink,
  learnMoreLink,
  tokens,
  chainId,
  displayInsufficientBalance = false,
}: StrategyCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract the base description without "Learn More" text
  const baseDescription = description.replace(/\s*Learn More\s*$/, "");

  return (
    <>
      <div className="flex flex-col items-center gap-[18px] p-5 bg-white rounded-2xl shadow-[0px_21px_27px_-10px_rgba(71,114,234,0.65)]">
        <div className="flex justify-around items-center w-full">
          <Image
            src={image}
            alt={title}
            width={60}
            height={60}
            className="rounded-lg object-cover cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
          <div className="flex flex-col justify-center gap-2.5 w-[224px]">
            <div className="flex gap-[3px] self-stretch">
              <h3 className="font-[family-name:var(--font-manrope)] text-[18px] font-bold text-lg text-[#17181C]">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-inter)] font-medium text-base text-[#17181C]">
                APY {apy}%
              </span>
              <div
                className="flex justify-center items-center px-2 py-1 rounded-lg"
                style={{ backgroundColor: getRiskColor(risk).bg }}
              >
                <span
                  className="font-[family-name:var(--font-inter)] text-xs font-medium"
                  style={{ color: getRiskColor(risk).text }}
                >
                  {risk.level}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start self-stretch">
          <div className="flex flex-col items-start gap-[18px] self-stretch">
            <div className="flex items-center gap-2 self-stretch">
              <span className="font-[family-name:var(--font-inter)] text-[#17181C] text-sm font-medium">
                Protocol:
              </span>
              {externalLink ? (
                <Link
                  href={externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-[family-name:var(--font-inter)] text-[#3568E8] text-sm font-medium hover:underline"
                >
                  {protocol}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.33333 9.33333H2.66667V2.66667H6V1.33333H2.66667C1.93333 1.33333 1.33333 1.93333 1.33333 2.66667V9.33333C1.33333 10.0667 1.93333 10.6667 2.66667 10.6667H9.33333C10.0667 10.6667 10.6667 10.0667 10.6667 9.33333V6H9.33333V9.33333ZM7.33333 1.33333V2.66667H9.02L4.12 7.56667L5.06667 8.51333L10 3.58V5.33333H11.3333V1.33333H7.33333Z"
                      fill="#3568E8"
                    />
                  </svg>
                </Link>
              ) : (
                <span className="font-[family-name:var(--font-inter)] text-[#17181C] text-sm font-medium">
                  {protocol}
                </span>
              )}
            </div>
            <div className="flex flex-col items-start self-stretch">
              <p className="font-[family-name:var(--font-inter)] text-[#17181C] text-sm font-normal text-left">
                {baseDescription}
                {learnMoreLink && (
                  <Link
                    href={learnMoreLink}
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
        <button
          className="flex justify-center items-center py-2 px-4 bg-[#5F79F1] rounded-lg text-white font-medium hover:bg-[#4A64DC] transition-colors w-full"
          onClick={() => setIsModalOpen(true)}
        >
          Invest
        </button>
      </div>

      <InvestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        strategy={{
          title,
          apy,
          risk,
          protocol,
          description,
          image,
          externalLink,
          learnMoreLink,
          tokens,
          chainId,
        }}
        displayInsufficientBalance={displayInsufficientBalance}
      />
    </>
  );
}
