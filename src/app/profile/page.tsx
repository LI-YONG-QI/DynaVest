"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

import { useAssets } from "@/contexts/AssetsContext";
import AssetsTableComponent from "@/components/Profile/AssetsTable";
import TransactionsTableComponent from "@/components/Profile/TransactionsTable";
import StrategiesTableComponent from "@/components/Profile/StrategiesTable";
import { formatAmount } from "@/utils";
import { DepositDialog } from "@/components/DepositDialog";
import { USDC } from "@/constants/coins";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { usePrivy } from "@privy-io/react-auth";

const PROFILE_TABS = [
  {
    label: "Assets",
    value: "assets",
  },
  {
    label: "Strategies",
    value: "strategies",
  },
  {
    label: "Transactions",
    value: "transactions",
  },
];

function getTabComponent(tab: string) {
  switch (tab) {
    case "assets":
      return <AssetsTableComponent />;
    case "strategies":
      return <StrategiesTableComponent />;
    case "transactions":
      return <TransactionsTableComponent />;
    default:
      return null;
  }
}

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState(PROFILE_TABS[0].value);
  const { user: privyUser } = usePrivy();

  const { client } = useSmartWallets();
  const { profitsQuery, updateTotalValue, assetsBalance } = useAssets();
  const { data: profitsData } = profitsQuery;

  const totalProfit = profitsData?.reduce((acc, profit) => acc + profit, 0);
  const user = client?.account.address;

  // TODO: refactor reason -> unstable update information
  useEffect(() => {
    if (user && !assetsBalance.isLoading) {
      updateTotalValue.mutate(undefined, {
        onSuccess: () => {
          console.log("Total value updated");
        },
        onError: (error) => {
          console.error("Error updating total value", error);
        },
      });
    }
  }, [user, assetsBalance.isLoading]);

  return (
    <div className="pb-10 px-2 sm:px-0">
      <div className="bg-white rounded-lg min-h-[80vh] p-4 sm:p-8 overflow-hidden">
        {/*  Header - Icon Section and action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex-shrink-0">
              <Image
                src="/mock-profile-photo.png"
                alt="Profile"
                className="rounded-full bg-blue-500 object-cover"
                width={48}
                height={48}
              />
            </div>
            <div>
              <div className="flex gap-2 items-center">
                <h1 className="text-[#141A21] font-bold text-xl sm:text-2xl">
                  {privyUser?.google?.name}
                </h1>
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-px bg-[#c4d8f7] hidden sm:block"></div>

            <div className="rounded-lg px-3 sm:px-4 py-2 bg-[#E2EDFF] hover:bg-[#d0e0ff] transition-colors text-sm sm:text-base">
              <DepositDialog
                textClassName="text-sm sm:text-base"
                token={USDC}
              />
            </div>
            <div className="rounded-lg px-3 sm:px-4 py-2 bg-[#E2EDFF] hover:bg-[#d0e0ff] transition-colors text-sm sm:text-base">
              <WithdrawDialog
                textClassName="text-sm sm:text-base"
                token={USDC}
              />
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mb-6 sm:mb-8">
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-300">
              Available Balance
            </h4>
            <p className="text-base sm:text-lg font-bold tracking-wide">
              {Number(
                assetsBalance.data.reduce((acc, token) => acc + token.value, 0)
              ).toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-300">
              Total Profit
            </h4>
            <p className="text-green-500 font-bold tracking-wide text-base sm:text-lg">
              {totalProfit ? `${formatAmount(totalProfit)}` : "0"}
            </p>
          </div>
        </div>

        {/* Assets/Strategies/Transactions tabs */}
        <div className="mb-6 sm:mb-8 border-b border-gray-300 gap-x-2 sm:gap-x-5 flex">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedTab(tab.value)}
              className={`w-full py-2 px-1 sm:px-2 hover:bg-[#d0e0ff] border-b-4 font-bold transition-colors text-sm sm:text-base ${
                selectedTab === tab.value
                  ? "font-bold border-black"
                  : "text-gray-400 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table components */}
        <div className="overflow-x-auto">{getTabComponent(selectedTab)}</div>
      </div>
    </div>
  );
}
