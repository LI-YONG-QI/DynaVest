import Image from "next/image";
import Link from "next/link";

import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";

import InvestModal from "./InvestModal";
import { getRiskColor } from "@/utils";
import { useChat } from "@/contexts/ChatContext";
import type { Message, RiskLevel, StrategyMetadata } from "@/types";

function getRiskLevelLabel(risk: RiskLevel) {
  switch (risk) {
    case "low":
      return "Low Risk";
    case "medium":
      return "Medium Risk";
    case "high":
      return "High Risk";
    default:
      return "Unknown";
  }
}

export default function StrategyCard(strategy: StrategyMetadata) {
  const { title, id, apy, risk, description, tokens, chainId, protocol } =
    strategy;

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract the base description without "Learn More" text
  const baseDescription = description.replace(/\s*Learn More\s*$/, "");

  const { openChat, setMessages } = useChat();
  const router = useRouter();

  const handleCardClick = (e: MouseEvent) => {
    // Don't navigate if clicking on a link or button
    const target = e.target as HTMLElement;
    if (target.closest('a, button, [role="button"]')) {
      e.stopPropagation();
      return;
    }
    router.push(`/strategies/${id}`);
  };

  const handleBotClick = async () => {
    // const prompt = `Hello. Can you explain the ${title} in 50 words?`;

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: `${strategy.fullDescription}`,
      sender: "bot",
      timestamp: new Date(),
      type: "Text",
    };
    setMessages((prev) => [...prev, botMessage]);

    openChat();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-[0px_21px_27px_-10px_rgba(71,114,234,0.65)] h-full cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {/* Header Section */}
        <div className="flex justify-between md:justify-around items-center w-full">
          <Image
            src={`/crypto-icons/chains/${chainId}.svg`}
            alt={title}
            width={60}
            height={60}
            className="rounded-lg object-cover"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          />
          <div className="ml-4 flex flex-col justify-center gap-2.5 w-[224px]">
            <div className="flex gap-[3px] self-stretch">
              <h3 className="text-[18px] font-semibold text-[#17181C]">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-base text-[#17181C]">
                APY {apy} %
              </span>
              <div
                className="flex justify-center items-center px-2 py-1 rounded-lg"
                style={{ backgroundColor: getRiskColor(risk).bg }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: getRiskColor(risk).text }}
                >
                  {getRiskLevelLabel(risk)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Content Section - Flex Grow */}
        <div className="flex flex-col items-start self-stretch flex-grow">
          <div className="flex flex-col items-start gap-4 self-stretch my-4">
            <div className="flex items-center gap-2 self-stretch">
              <div className="grid grid-cols-12 gap-2 w-full">
                <div className="col-span-4 space-y-1">
                  <div className="text-sm">Protocol</div>
                  <div className="text-sm">TVL</div>
                  <div className="text-sm">Tokens</div>
                </div>
                <div className="col-span-7 space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {protocol.name}
                    </span>
                    {protocol.link && (
                      <Link
                        href={protocol.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-[#3568E8] hover:underline"
                        aria-label="Open protocol in new tab"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.33333 9.33333H2.66667V2.66667H6V1.33333H2.66667C1.93333 1.33333 1.33333 1.93333 1.33333 2.66667V9.33333C1.33333 10.0667 1.93333 10.6667 2.66667 10.6667H9.33333C10.0667 10.6667 10.6667 10.0667 10.6667 9.33333V6H9.33333V9.33333ZM7.33333 1.33333V2.66667H9.02L4.12 7.56667L5.06667 8.51333L10 3.58V5.33333H11.3333V1.33333H7.33333Z"
                            fill="currentColor"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>

                  {/* TODO: Use real TVL */}
                  <p className="text-sm text-gray-900">
                    $
                    {Math.abs(
                      title
                        .split("")
                        .reduce(
                          (hash, char) =>
                            (hash << 5) - hash + char.charCodeAt(0),
                          0
                        ) % 100
                    )}
                    M
                  </p>

                  <div className="text-sm text-gray-900 flex items-center">
                    {tokens.map((token) => (
                      <div key={token.name} className="w-5 h-5 relative">
                        <Image
                          src={token.icon}
                          alt={token.name}
                          className="object-contain"
                          fill
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 flex items-start justify-end">
                  <Tooltip description={baseDescription} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action button section - always stay at bottom */}
        <div className="w-full mt-auto flex items-center gap-5">
          <button
            className="flex justify-center items-center py-2 px-4 bg-[#5F79F1] rounded-lg text-white font-medium hover:bg-[#4A64DC] transition-colors w-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            Invest
          </button>
          <button onClick={handleBotClick}>
            <Image src="/bot-icon-blue.svg" alt="bot" width={30} height={30} />
          </button>
        </div>
      </div>

      <InvestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        strategy={strategy}
      />
    </>
  );
}
