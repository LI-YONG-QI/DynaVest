import Image from "next/image";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { formatCoin, formatCurrency } from "@/utils";
import { getTokenByName } from "@/constants/coins";
import {
  getProtocolMetadata,
  STRATEGIES_PROTOCOLS_MAPPING,
} from "@/constants/protocols/metadata";
import { useStrategyExecutor } from "@/hooks/useStrategyExecutor";
import { convertStrategyName } from "./utils";
import { getStrategy } from "@/utils/strategies";
import { type Position } from "./useProfilePosition";
import { useCurrencyPrice } from "@/hooks/useCurrency";
import { toast } from "react-toastify";
import { useProfit } from "./useProfit";

interface PositionTableRowProps {
  position: Position;
  index: number;
}

export default function PositionTableRow({
  position,
  index,
}: PositionTableRowProps) {
  const token = getTokenByName(position.tokenName);

  const { data: price = 0, isLoading } = useCurrencyPrice(token);
  const { redeem } = useStrategyExecutor();
  const chainId = useChainId();
  const { data: profit = "0" } = useProfit(position);

  const handleRedeem = () => {
    const strategy = getStrategy(
      convertStrategyName(position.strategy),
      chainId
    );

    redeem.mutate(
      {
        strategy,
        amount: BigInt(position.amount),
        token,
      },
      {
        onSuccess: (txHash) => {
          toast.success(`Redeem successful: ${txHash}`);
        },
        onError: (error) => {
          console.error(error);
          toast.error(`Redeem failed`);
        },
      }
    );
  };

  return (
    <tr
      key={`${position.strategy}-${position.tokenName}-${index}`}
      className="bg-white rounded-xl shadow-[0_0_0_0.2px_#3d84ff,_0px_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1.5px_#3d84ff,_0px_4px_12px_rgba(0,0,0,0.15)] transition-all"
    >
      {/* Strategy */}
      <td className="p-4 rounded-l-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
            <Image
              src={`${
                getProtocolMetadata(
                  position.strategy as keyof typeof STRATEGIES_PROTOCOLS_MAPPING
                ).icon
              }`}
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
              src={`${token.icon}`}
              alt={token.icon}
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-end text-left min-w-[70px]">
            <div className="font-bold">{token.name}</div>
            {/* No symbol <div className="text-sm text-gray-500">{1234567}</div> */}
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="p-4 text-right">
        <div className="font-medium text-md">
          {isLoading
            ? "0.00"
            : formatUnits(BigInt(position.amount), token.decimals).toString()}
        </div>
        <div className="text-sm text-gray-500">
          {isLoading
            ? "0.00"
            : formatCurrency(
                Number(formatUnits(BigInt(position.amount), token.decimals)) *
                  price
              )}
        </div>
      </td>

      {/* Profit */}
      <td className="p-4 text-right">
        <div className="font-medium text-md">{formatCoin(Number(profit))}</div>
        <div className="text-sm text-gray-500">
          {formatCurrency(Number(profit))}
        </div>
      </td>

      {/* Actions */}
      <td className="p-4 text-right rounded-r-xl">
        <div className="flex justify-end gap-1">
          <button
            onClick={handleRedeem}
            className="px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-gray-50 transition-colors"
          >
            Redeem
          </button>
        </div>
      </td>
    </tr>
  );
}
