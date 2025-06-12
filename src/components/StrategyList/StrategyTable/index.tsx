import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { getRiskColor } from "@/utils";
import { useChat } from "@/contexts/ChatContext";
import type { RiskLevel, StrategyMetadata } from "@/types";
interface StrategyTableProps {
  strategies: Array<StrategyMetadata>;
}

function getRiskLevelLabel(risk: RiskLevel) {
  switch (risk) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Unknown";
  }
}

export default function StrategyTable({ strategies }: StrategyTableProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { openChat } = useChat();

  // Sort strategies by APY
  const sortedStrategies = [...strategies].sort((a, b) => {
    return sortOrder === "asc" ? a.apy - b.apy : b.apy - a.apy;
  });

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className=" w-full">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="">
          <tr>
            <th
              scope="col"
              className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[20%]"
            >
              Strategy
            </th>
            <th
              scope="col"
              className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[10%]"
            >
              Risk
            </th>
            <th
              scope="col"
              className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[15%]"
            >
              Chain
            </th>
            <th
              scope="col"
              className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[20%]"
            >
              Protocol
            </th>
            <th
              scope="col"
              className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[10%]"
            >
              Type
            </th>
            <th
              scope="col"
              className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[10%] cursor-pointer"
              onClick={toggleSortOrder}
            >
              <div className="flex items-center">
                APY
                <svg
                  className="ml-1 w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {sortOrder === "asc" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    ></path>
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 13l5 5m0 0l5-5m-5 5V6"
                    ></path>
                  )}
                </svg>
              </div>
            </th>
            <th
              scope="col"
              className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[15%]"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedStrategies.map((strategy, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {/* Title */}
              <td className="pr-2 py-4">
                <div className="flex items-center flex-wrap">
                  <div className="">
                    <div className="text-sm font-medium text-gray-900">
                      {strategy.title}
                    </div>
                  </div>
                </div>
              </td>
              {/* Risk */}
              <td className="pr-2 py-4">
                <div
                  className="inline-flex px-2 py-1 text-sm rounded-lg"
                  style={{ backgroundColor: getRiskColor(strategy.risk).bg }}
                >
                  <span
                    className="font-medium"
                    style={{ color: getRiskColor(strategy.risk).text }}
                  >
                    {getRiskLevelLabel(strategy.risk)}
                  </span>
                </div>
              </td>
              {/* Chain */}
              {/* TODO: Display actual chain information */}
              <td className="pr-2 py-4 text-sm text-gray-500">
                <div className="flex items-center gap-x-2">
                  <Image
                    src={strategy.image}
                    alt={strategy.title}
                    width={24}
                    height={24}
                  />
                  <span>Ethereum</span>
                </div>
              </td>
              {/* Protocol */}
              <td className="pr-2 py-4">
                <div className="text-sm text-gray-900 truncate">
                  <div className="flex items-center gap-x-1 flex-wrap">
                    <Image
                      src={strategy.image}
                      alt={strategy.title}
                      width={24}
                      height={24}
                    />
                    {strategy.id}
                    {strategy.externalLink && (
                      <Link
                        href={strategy.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline text-[#5F79F1]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </td>
              {/* Type */}
              {/* TODO: Display protocol type */}
              <td className="pr-2 py-4 text-sm text-gray-500">Lending</td>
              {/* APY */}
              <td className="pr-2 py-4 text-sm font-medium text-[#17181C]">
                {strategy.apy}
              </td>
              {/* Actions */}
              {/* TODO: Add business logic */}
              <td className="pr-2 py-4 text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="bg-[#5F79F1] text-white px-3 py-1.5 rounded-sm font-medium">
                    Deposit
                  </button>
                  <button
                    onClick={() =>
                      openChat(
                        `Hello! How can I help you with ${strategy.title}?`
                      )
                    }
                    className="bg-[#5F79F1] text-white px-3 py-1.5 rounded-sm font-medium"
                  >
                    Ask AI
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
