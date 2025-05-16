import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
type Transaction = {
  id: string;
  createdAt: string;
  strategy: string;
  hash: string;
  type: string;
  amount: number;
  chainId: number;
  icon: string;
  tokenName: string;
};

const initialTransactions: Transaction[] = [];

export default function TransactionsTableComponent() {
  const { client } = useSmartWallets();
  const chainId = useChainId();

  const { data: transactions = initialTransactions } = useQuery({
    queryKey: ["transactions", client?.account.address, chainId],
    queryFn: async () => {
      const response = await axios.get<{ txs: Transaction[] }>(
        `/api/user?address=${client?.account.address}`
      );

      const txs = response.data.txs;
      const filteredTxs = txs.filter((tx) => tx.chainId === chainId);

      return filteredTxs;
    },
    enabled: !!client?.account.address,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="mx-4 w-[calc(100%-2rem)]">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-sm font-semibold text-gray-500">
            <th className="w-[20%] text-left px-6 font-medium">Date</th>
            <th className="w-[30%] text-left px-4 font-medium">Strategy</th>
            <th className="w-[20%] text-left px-4 font-medium">Type</th>
            <th className="w-[30%] text-left px-6 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              onClick={() =>
                // TODO: hardcode chain
                window.open(
                  `https://basescan.org/tx/${transaction.hash}`,
                  "_blank"
                )
              }
              key={`${transaction.id}`}
              className="bg-white rounded-xl shadow-[0_0_0_0.2px_#3d84ff,_0px_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1.5px_#3d84ff,_0px_4px_12px_rgba(0,0,0,0.15)] transition-all"
            >
              {/* Date */}
              <td className="p-4 rounded-l-xl">
                <div className="font-medium text-md">
                  {transaction.createdAt}
                </div>
              </td>

              {/* Strategy */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={
                        // TODO: hardcoded for now
                        transaction.icon
                      }
                      alt={"crypto-icons/aave.svg"}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{transaction.strategy}</div>
                  </div>
                </div>
              </td>

              {/* Type */}
              <td className="p-4">
                <div className="font-medium text-md">{transaction.type}</div>
              </td>

              {/* Amount */}
              <td className="p-4 rounded-r-xl">
                <div className="font-medium text-md">
                  {formatUnits(BigInt(transaction.amount), 6)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
