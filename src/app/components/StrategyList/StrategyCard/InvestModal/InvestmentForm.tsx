import Image from "next/image";
import { FC, useState } from "react";

import useCurrency from "@/app/hooks/useCurrency";
import useSwitchChain from "@/app/hooks/useSwitchChain";
import InvestModalButton from "./button";
import { InvestStrategy } from "@/app/utils/types";

// Props interface
interface InvestmentFormProps {
  strategy: InvestStrategy;
  handleClose?: () => void;
}

const InvestmentForm: FC<InvestmentFormProps> = ({ strategy, handleClose }) => {
  const [amount, setAmount] = useState<string>("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const { isSupportedChain } = useSwitchChain(strategy.chainId);
  const {
    currency,
    setCurrency,
    balance: maxBalance,
    isLoadingBalance,
  } = useCurrency(strategy.tokens);

  // Handle setting max amount
  const handleSetMax = () => {
    setAmount(maxBalance.toString());
  };

  return (
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
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
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
          <div className="flex items-center w-full">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <span>Balance: </span>
              <div>
                {isLoadingBalance ? (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                ) : isSupportedChain ? (
                  maxBalance.toFixed(4)
                ) : (
                  "NaN"
                )}
              </div>
              <span>{currency.name}</span>
            </span>
            <button
              type="button"
              onClick={handleSetMax}
              disabled={!isSupportedChain || isLoadingBalance}
              className="text-sm font-medium text-[#5F79F1] hover:text-[#4A64DC] focus:outline-none ml-2 border-0 bg-transparent cursor-pointer disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>
      </div>
      {/* Invest button */}
      <InvestModalButton
        currency={currency}
        strategy={strategy}
        amount={amount}
        handleClose={handleClose}
      />
    </div>
  );
};

export default InvestmentForm;
