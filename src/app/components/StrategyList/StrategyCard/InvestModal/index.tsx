/* eslint-disable */

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAccount, useChainId } from "wagmi";
import { toast } from "react-toastify";
import { parseUnits } from "viem";

import { getRiskColor } from "@/app/utils";
import { getStrategy } from "@/app/utils/strategies";
import type { Token } from "@/app/utils/types";
import useCurrency from "@/app/hooks/useCurrency";
import useSwitchChain from "@/app/hooks/useSwitchChain";

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: {
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
    chainId: number;
    tokens: Token[];
  };
  displayInsufficientBalance?: boolean;
}

export default function InvestModal({
  isOpen,
  onClose,
  strategy,
  displayInsufficientBalance = true, // todo: dynamic
}: InvestModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [orderHash, setOrderHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { address: user } = useAccount();
  const chainId = useChainId();
  const { currency, setCurrency, balance } = useCurrency(strategy.tokens);
  const {
    handleSwitchChain,
    isSupportedChain,
    ready: isWalletReady,
  } = useSwitchChain(strategy.chainId);

  const maxBalance = balance;

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle setting max amount
  const handleSetMax = () => {
    setAmount(maxBalance.toString());
  };

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match this with the CSS transition duration
  };

  // Handle investment submission
  const handleInvest = async () => {
    if (user) {
      const strategyHandler = getStrategy(strategy.protocol, chainId);
      const parsedAmount = parseUnits(amount, currency.decimals);

      try {
        const result = await strategyHandler.execute(user, parsedAmount);
        toast.success(`Investment successful! ${result}`);

        handleClose();
      } catch (error) {
        toast.error("Investment failed!");
      }
    }
  };

  // Handle swap submission
  const handleSwap = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "1000000",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      console.log("Order placed successfully:", data.orderHash);
      setOrderHash(data.orderHash);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error during swap:", error);
      setSwapError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: "rgba(200, 200, 200, 0.6)" }}
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 pointer-events-auto transition-all duration-300 ${
            isClosing
              ? "opacity-0 transform scale-95"
              : "opacity-100 transform scale-100"
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-transparent border-black border-solid border-2 rounded-full p-1 hover:bg-gray-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Invest modal header */}
          <div className="p-6">
            <div className="flex items-start mb-6">
              {/* Strategy icon (spans 2 rows) */}
              <div className="mr-4">
                <Image
                  src={strategy.image}
                  alt={strategy.title}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
              </div>

              <div className="flex-1">
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {strategy.title}
                </h3>

                {/* APY and Risk on same row */}
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-medium text-gray-900">
                    APY {strategy.apy}%
                  </div>
                  <div
                    className="px-2 py-1 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: getRiskColor(strategy.risk).bg,
                      color: getRiskColor(strategy.risk).text,
                    }}
                  >
                    {strategy.risk.level} Risk
                  </div>
                </div>
              </div>
            </div>
            {/* Invest modal content */}
            <div>
              {displayInsufficientBalance ? (
                <div>
                  {/* Insufficient balance - swap view */}
                  <div className="mb-6">
                    <h3>Insufficient Balance!!!</h3>

                    <p>Do you want to swap USDC from ETHEREUM to BASE</p>
                  </div>
                  {/* Confirm Swap button */}
                  <button
                    type="button"
                    onClick={handleSwap}
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#5F79F1] hover:bg-[#4A64DC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Confirm Swap"}
                  </button>

                  {isSuccess && (
                    <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
                      Order placed successfully! Order hash: {orderHash}
                    </div>
                  )}

                  {swapError && (
                    <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                      {swapError}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Amount input */}
                  <div className="bg-gray-100 rounded-md border border-gray-300 mb-6">
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="amount"
                        id="amount"
                        className="bg-transparent text-gray-500 block px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-0 focus:border-0 placeholder:text-gray-500"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      {/* Custom dropdown with icons */}
                      <div className="ml-auto min-w-[100px] relative">
                        <button
                          type="button"
                          className="bg-transparent flex items-center gap-2 px-4 py-2 text-lg font-semibold focus:outline-none rounded-md hover:bg-gray-200"
                          onClick={() =>
                            setShowCurrencyDropdown(!showCurrencyDropdown)
                          }
                        >
                          <Image
                            src={currency.icon}
                            alt={currency.name}
                            className="w-6 h-6 object-contain"
                            width={24}
                            height={24}
                          />
                          {currency.name}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {showCurrencyDropdown && (
                          <div className="absolute right-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                            {strategy.tokens.map((token) => (
                              <button
                                key={token.name}
                                type="button"
                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                                onClick={() => {
                                  setCurrency(token);
                                  setShowCurrencyDropdown(false);
                                }}
                              >
                                <Image
                                  src={token.icon}
                                  alt={token.name}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain"
                                />
                                {token.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center px-4 pb-2">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500">
                          Balance: {maxBalance.toFixed(2)} {currency.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleSetMax}
                          className="text-sm font-medium text-[#5F79F1] hover:text-[#4A64DC] focus:outline-none ml-1 border-0 bg-transparent cursor-pointer"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Invest button */}
                  {isWalletReady ? (
                    <button
                      type="button"
                      onClick={
                        isSupportedChain ? handleInvest : handleSwitchChain
                      }
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#5F79F1] hover:bg-[#4A64DC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSupportedChain ? "Invest" : "Switch Chain"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#5F79F1] hover:bg-[#4A64DC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      Loading...
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
