import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatUnits } from "viem";

import { formatCoin, formatCurrency } from "@/utils";
import { useProfilePosition } from "./useProfilePosition";
import { getTokenByName } from "@/constants/coins";

export default function StrategiesTableComponent() {
  const [sortKey, setSortKey] = useState<"amount" | null>("amount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { data: positions, isError, error } = useProfilePosition();

  const sortedData = positions
    ? [...positions].sort((a, b) => {
        if (!sortKey) return 0;
        return sortDirection === "asc"
          ? a[sortKey] - b[sortKey]
          : b[sortKey] - a[sortKey];
      })
    : [];

  const handleSort = () => {
    if (sortKey === "amount") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey("amount");
      setSortDirection("desc");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error("Error fetching positions");
    }
  }, [isError, error]);

  return (
    <div className="mx-4 w-[calc(100%-2rem)]">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-sm font-semibold text-gray-500">
            <th className="w-[20%] text-left px-6 font-medium">Strategy</th>
            <th className="w-[20%] text-right px-4 font-medium">Asset</th>
            <th
              className="w-[20%] text-right px-4 font-medium cursor-pointer"
              onClick={handleSort}
            >
              <div className="flex items-center justify-end">
                Amount
                {sortKey === "amount" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="w-[20%] text-right px-4 font-medium">Profit</th>
            <th className="w-[20%] text-right px-6 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((position, index) => (
            <tr
              key={`${position.strategy}-${position.tokenName}-${index}`}
              className="bg-white rounded-xl shadow-[0_0_0_0.2px_#3d84ff,_0px_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1.5px_#3d84ff,_0px_4px_12px_rgba(0,0,0,0.15)] transition-all"
            >
              {/* Strategy */}
              <td className="p-4 rounded-l-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={`${getTokenByName(position.tokenName).icon}`}
                      alt={position.strategy}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{position.strategy}</div>
                  </div>
                </div>
              </td>

              {/* Asset */}
              <td className="p-4">
                <div className="flex items-center gap-3 justify-end">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={`${getTokenByName(position.tokenName).icon}`}
                      alt={getTokenByName(position.tokenName).icon}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-end text-left min-w-[70px]">
                    <div className="font-bold">
                      {getTokenByName(position.tokenName).name}
                    </div>
                    {/* No symbol <div className="text-sm text-gray-500">{1234567}</div> */}
                  </div>
                </div>
              </td>

              {/* Amount */}
              <td className="p-4 text-right">
                <div className="font-medium text-md">
                  {formatUnits(
                    BigInt(position.amount),
                    getTokenByName(position.tokenName).decimals
                  ).toString()}
                </div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(1234567)}
                </div>
              </td>

              {/* Profit */}
              <td className="p-4 text-right">
                <div className="font-medium text-md">{formatCoin(1234567)}</div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(1234567)}
                </div>
              </td>

              {/* Actions */}
              <td className="p-4 text-right rounded-r-xl">
                <div className="flex justify-end gap-1">
                  <button className="px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-gray-50 transition-colors">
                    Invest
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-gray-50 transition-colors">
                    Redeem
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
