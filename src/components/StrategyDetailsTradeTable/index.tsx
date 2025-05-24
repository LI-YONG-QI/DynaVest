"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";

interface Trade {
  id: string;
  date: string;
  amount: string;
  address: string;
  txId: string;
}

const generateMockData = (count: number): Trade[] => {
  return Array.from({ length: count }, () => ({
    id: Math.random().toString(36).substr(2, 9),
    date: "2 mins ago",
    amount: "1,000 USDC",
    address: "0x345...a8c9",
    txId: "0x345...a8c9",
  }));
};

export function StrategyDetailsTradeTable() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const page = useRef(1);
  const itemsPerPage = 10;

  // TODO: Use real data
  const loadTrades = useCallback(() => {
    if (loading || page.current > 3) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newTrades = generateMockData(itemsPerPage);
      setTrades((prev) => [...prev, ...newTrades]);

      // Stop loading more after 5 pages for demo
      setHasMore(page.current < 5);

      setLoading(false);
      page.current += 1;
    }, 1000);
  }, [loading]);

  const lastTradeElementRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadTrades();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadTrades]
  );

  useEffect(() => {
    loadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500">
            <th className="py-3 font-medium">Date</th>
            <th className="py-3 font-medium">Amount</th>
            <th className="py-3 font-medium">Address</th>
            <th className="py-3 font-medium">TXID</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {trades.map((trade, index) => (
            <tr
              key={trade.id}
              ref={index === trades.length - 1 ? lastTradeElementRef : null}
              className="hover:bg-gray-50"
            >
              <td className="py-3 text-sm">{trade.date}</td>

              <td className="py-3 text-sm font-medium">{trade.amount}</td>

              <td className="py-3">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="text-sm">{trade.address}</span>
                  <Link
                    href={`https://etherscan.io/address/${trade.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    <Image
                      src="/external-link.svg"
                      alt="External Link"
                      width={16}
                      height={16}
                      className="shrink-0"
                    />
                  </Link>
                </div>
              </td>

              <td className="py-3">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="text-sm">{trade.txId}</span>
                  <Link
                    href={`https://etherscan.io/tx/${trade.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    <Image
                      src="/external-link.svg"
                      alt="External Link"
                      width={16}
                      height={16}
                      className="shrink-0"
                    />
                  </Link>
                </div>
              </td>
            </tr>
          ))}

          {loading && (
            <tr>
              <td
                colSpan={4}
                className="py-3 text-center text-sm text-gray-500"
              >
                <div className="flex justify-center items-center h-8">
                  <div className="relative w-16 h-4 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-[2px] h-2 bg-black rounded-lg"
                        style={{
                          transform: `rotate(${i * 45}deg) translateY(-10px)`,
                          opacity: 0,
                          animation: "fade 1.5s infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                    <style jsx>{`
                      @keyframes fade {
                        0%,
                        100% {
                          opacity: 0.1;
                        }
                        50% {
                          opacity: 1;
                        }
                      }
                    `}</style>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
