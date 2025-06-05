import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { useAssets } from "@/contexts/AssetsContext";
import { WithdrawDialog } from "@/components/WithdrawDialog";
import { DepositDialog } from "@/components/DepositDialog";

export default function AssetsTableComponent() {
  const { tokensQuery } = useAssets();
  const { data: tokensData, isError, error, isLoadingError } = tokensQuery;
  const [sortKey, setSortKey] = useState<"balance" | null>("balance");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = () => {
    if (sortKey === "balance") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey("balance");
      setSortDirection("desc");
    }
  };

  const sortedData = useMemo(() => {
    return tokensData?.sort((a, b) => {
      if (!sortKey) return 0;
      return sortDirection === "asc"
        ? a[sortKey] - b[sortKey]
        : b[sortKey] - a[sortKey];
    });
  }, [tokensData, sortKey, sortDirection]);

  useEffect(() => {
    if (isError && isLoadingError) {
      console.log(error);
      toast.error("Error fetching assets");
    }
  }, [isError, isLoadingError, error]);

  return (
    <div className="mx-4 w-[calc(100%-2rem)]">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-sm font-semibold text-gray-500">
            <th className="w-[30%] text-left px-6 font-medium">Coin</th>
            <th
              className="w-[15%] text-right px-4 font-medium cursor-pointer"
              onClick={handleSort}
            >
              <div className="flex items-center justify-end">
                Balance
                {sortKey === "balance" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData?.map((asset) => (
            <tr
              key={asset.token.name}
              className="bg-white rounded-xl shadow-[0_0_0_0.2px_#3d84ff,_0px_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1.5px_#3d84ff,_0px_4px_12px_rgba(0,0,0,0.15)] transition-all"
            >
              {/* Coin */}
              <td className="p-4 rounded-l-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={asset.token.icon}
                      alt={asset.token.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{asset.token.name}</div>
                    <div className="text-sm text-gray-500">
                      {asset.token.name}
                    </div>
                  </div>
                </div>
              </td>

              {/* Balance */}
              <td className="p-4 text-right">
                <div className="font-medium text-md">
                  {asset.balance.toFixed(4).toString()}
                </div>
                <div className="text-sm text-gray-500">
                  {`$ ${asset.value.toFixed(2)}`}
                </div>
              </td>

              {/* Actions */}
              <td className="p-4 text-right rounded-r-xl">
                <div className="flex justify-end gap-1">
                  <DepositDialog token={asset.token} />

                  <WithdrawDialog token={asset.token} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
