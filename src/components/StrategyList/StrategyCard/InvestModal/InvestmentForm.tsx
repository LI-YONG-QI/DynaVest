import Image from "next/image";
import { FC, useState, useEffect, FormEvent } from "react";
import { toast } from "react-toastify";
import { useChainId } from "wagmi";
import { formatUnits, parseUnits } from "viem";

import useCurrency from "@/hooks/useCurrency";
import useSwitchChain from "@/hooks/useSwitchChain";
import { InvestStrategy } from "@/types";
import { MoonLoader } from "react-spinners";
import { getStrategy } from "@/utils/strategies";
import { useStrategyExecutor } from "@/hooks/useStrategyExecutor";
import {
  SuiStrategy,
  useSuiStrategyExecutor,
} from "@/hooks/useSuiStrategyExecutor";
import { sui } from "@/constants/chains";

// Props interface
interface InvestmentFormProps {
  strategy: InvestStrategy;
  handleClose?: () => void;
  handlePortfolio?: (amount: string) => void;
}

enum ButtonState {
  Pending = "Processing...",
  Invest = "Invest",
  SwitchChain = "Switch Chain",
}

const InvestmentForm: FC<InvestmentFormProps> = ({
  strategy,
  handleClose,
  handlePortfolio,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>(
    ButtonState.Pending
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    switchChain,
    isSupportedChain,
    ready: isWalletReady,
  } = useSwitchChain(strategy.chainId);

  const {
    currency,
    setCurrency,
    balance: maxBalance,
    isLoadingBalance,
  } = useCurrency(strategy.tokens[0]);

  const chainId = useChainId();
  const { execute } = useStrategyExecutor();
  const { execute: executeSuiStrategy } = useSuiStrategyExecutor();

  const AMOUNT_LIMIT = 0.01;

  // Handle setting max amount
  const handleSetMax = () => {
    setAmount(maxBalance.toString());
  };

  const invest = async () => {
    if (Number(amount) < AMOUNT_LIMIT) {
      toast.error("Investment amount must be greater than 0.01");
      return;
    }

    if (handlePortfolio) {
      handlePortfolio(amount);
      setIsDisabled(false);
    } else {
      executeStrategy();
    }
  };

  const handleSwitchChain = async () => {
    try {
      await switchChain();
      toast.success("Switched chain successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to switch chain");
    }
  };

  const executeStrategy = async () => {
    setIsLoading(true);

    if (strategy.chainId === sui.id) {
      console.log("sui");
      const result = await executeSuiStrategy(
        new SuiStrategy(sui.id),
        BigInt(1_000_000)
      );
      toast.success(`Investment successful! ${result}`);
      return;
    }

    const strategyHandler = getStrategy(strategy.protocol, chainId);
    const parsedAmount = parseUnits(amount, currency.decimals);

    try {
      let result;
      if (currency.isNativeToken) {
        result = await execute(strategyHandler, parsedAmount);
      } else {
        result = await execute(
          strategyHandler,
          parsedAmount,
          currency.chains![chainId]
        );
      }

      toast.success(`Investment successful! ${result}`);

      if (handleClose) handleClose();
    } catch (error) {
      console.error(error);
      toast.error(`Investment failed! ${error}`);
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    switch (buttonState) {
      case ButtonState.Invest:
        invest();
        break;
      case ButtonState.SwitchChain:
        handleSwitchChain();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setButtonState(
      isLoading
        ? ButtonState.Pending
        : !isWalletReady
        ? ButtonState.Pending
        : isSupportedChain
        ? ButtonState.Invest
        : ButtonState.SwitchChain
    );
    setIsDisabled(isLoading);
  }, [isWalletReady, isLoading, isSupportedChain]);

  return (
    <form onSubmit={handleSubmit}>
      {/* Amount input */}
      <div className="bg-gray-100 rounded-md border border-gray-300 mb-6">
        <div className="flex items-center w-full gap-2">
          <input
            type="text"
            name="amount"
            id="amount"
            className="flex-1 min-w-0 bg-transparent text-gray-500 block px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-0 focus:border-0 placeholder:text-gray-500"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Custom dropdown with icons */}
          <div className="shrink-0 md:min-w-[100px] relative">
            <button
              type="button"
              className="text-sm md:text-lg bg-transparent flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 font-semibold focus:outline-none rounded-md hover:bg-gray-200"
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
                className="h-3 w-3 md:h-5 md:w-5 md:ml-1"
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
                    className="w-full flex items-center gap-1 px-2 md:gap-2 md:px-4 py-2 text-left hover:bg-gray-100"
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
            <span className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <span>Balance: </span>
              <div>
                {isLoadingBalance ? (
                  <MoonLoader size={10} />
                ) : isSupportedChain ? (
                  formatUnits(maxBalance, currency.decimals)
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
              className="text-xs md:text-sm font-medium text-[#5F79F1] hover:text-[#4A64DC] focus:outline-none ml-2 border-0 bg-transparent cursor-pointer disabled:opacity-50"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Invest button */}
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#5F79F1] hover:bg-[#4A64DC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {buttonState}
      </button>
    </form>
  );
};

export default InvestmentForm;
