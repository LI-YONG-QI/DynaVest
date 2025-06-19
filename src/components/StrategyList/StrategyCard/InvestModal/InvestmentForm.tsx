// Shared component for invest, withdraw and LP
import Image from "next/image";
import { FC, useState, useEffect, FormEvent } from "react";
import { toast } from "react-toastify";
import { useChainId, useSwitchChain as useWagmiSwitchChain } from "wagmi";
import { parseUnits, formatUnits } from "viem";

import useBalance from "@/hooks/useBalance";

import { InvestmentFormMode, type StrategyMetadata, Token } from "@/types";
import { MoonLoader } from "react-spinners";
import { getStrategy } from "@/utils/strategies";
import { useStrategy } from "@/hooks/useStrategy";
import { useWallets } from "@privy-io/react-auth";
import { DepositDialog } from "@/components/DepositDialog";
import { useAssets } from "@/contexts/AssetsContext";

// Props interface

// TODO: refactor
// TODO: split responsibilities of the AmountInput (avoid props drilling)
interface InvestmentFormProps {
  strategy: StrategyMetadata;
  mode?: InvestmentFormMode;
  handleClose?: () => void;
  chat?: {
    handlePortfolio: (amount: string) => void;
  };
}

enum ButtonState {
  Pending = "Processing...",
  Invest = "Invest",
  Withdraw = "Withdraw",
  LP = "Add Liquidity",
  SwitchChain = "Switch Chain",
}

const InvestmentForm: FC<InvestmentFormProps> = ({
  strategy,
  mode = "invest",
  handleClose,
  chat,
}) => {
  // User context
  const chainId = useChainId();
  const isSupportedChain = chainId === strategy.chainId;
  const { ready: isWalletReady } = useWallets();
  const { switchChainAsync } = useWagmiSwitchChain();
  const { assetsBalance } = useAssets();
  const [isDeposit, setIsDeposit] = useState(false);

  // first token input
  const [amount, setAmount] = useState<string>("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [currency, setCurrency] = useState<Token>(strategy.tokens[0]);
  const { balance: maxBalance = BigInt(0), isLoadingBalance } =
    useBalance(currency);

  // second token input - for LP
  const [secondAmount, setSecondAmount] = useState<string>("");
  const [showSecondCurrencyDropdown, setShowSecondCurrencyDropdown] =
    useState(false);
  const [secondCurrency, setSecondCurrency] = useState<Token>(
    strategy.tokens?.[1] || strategy.tokens[0]
  );
  const {
    balance: secondMaxBalance = BigInt(0),
    isLoadingBalance: isLoadingSecondBalance,
  } = useBalance(secondCurrency);

  // Button state
  const [buttonState, setButtonState] = useState<ButtonState>(
    ButtonState.Pending
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { invest: investStrategy } = useStrategy();

  // Advanced settings state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slippage, setSlippage] = useState<number | "auto">("auto");
  const [customSlippage, setCustomSlippage] = useState("");

  const AMOUNT_LIMIT = 0;

  // Handle setting max amount
  const handleSetMax = () => {
    setAmount(formatUnits(maxBalance, currency.decimals));
  };

  const invest = async () => {
    if (Number(amount) < AMOUNT_LIMIT) {
      toast.error("Investment amount must be greater than 0.01");
      return;
    }

    const asset = assetsBalance.data.find((asset) => asset.token === currency);

    // Check balance is zero and no chat process
    if (asset?.balance === BigInt(0) && !chat) {
      setIsDeposit(true);
      return;
    }

    if (chat?.handlePortfolio) {
      chat.handlePortfolio(amount);
      setIsDisabled(false);
    } else {
      executeStrategy();
    }
  };

  // TODO: Support withdrawal
  const withdraw = () => {
    console.log("Withdraw");
  };

  // TODO: Support LP
  const processLp = () => {
    console.log("LP");
  };

  const handleSwitchChain = async (chainId: number) => {
    try {
      await switchChainAsync({ chainId });
      toast.success("Switched chain successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to switch chain");
    }
  };

  const executeStrategy = async () => {
    setIsLoading(true);

    const strategyHandler = getStrategy(strategy.id, chainId);
    const parsedAmount = parseUnits(amount, currency.decimals);

    investStrategy.mutate(
      {
        strategy: strategyHandler,
        amount: parsedAmount,
        token: currency,
      },
      {
        onSuccess: (tx) => {
          toast.success(`Investment successful! ${tx}`);
          if (handleClose) handleClose();
        },
        onError: (error) => {
          console.error(error);
          toast.error(`Investment failed! ${error}`);
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    switch (buttonState) {
      case ButtonState.Invest:
        invest();
        break;
      case ButtonState.Withdraw:
        withdraw();
        break;
      case ButtonState.LP:
        processLp();
        break;
      case ButtonState.SwitchChain:
        handleSwitchChain(strategy.chainId);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const getButtonState = () => {
      if (isLoading || !isWalletReady) {
        return ButtonState.Pending;
      }

      if (!isSupportedChain) {
        return ButtonState.SwitchChain;
      }

      switch (mode) {
        case "invest":
          return ButtonState.Invest;
        case "withdraw":
          return ButtonState.Withdraw;
        case "lp":
          return ButtonState.LP;
        default:
          return ButtonState.Pending;
      }
    };

    setButtonState(getButtonState());
    setIsDisabled(isLoading);
  }, [isLoading, isSupportedChain, isWalletReady, mode]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Amount input */}
        <AmountInput
          amount={amount}
          setAmount={setAmount}
          currency={currency}
          setCurrency={setCurrency}
          showCurrencyDropdown={showCurrencyDropdown}
          setShowCurrencyDropdown={setShowCurrencyDropdown}
          strategy={strategy}
          isLoadingBalance={isLoadingBalance}
          isSupportedChain={isSupportedChain}
          maxBalance={maxBalance}
          handleSetMax={handleSetMax}
        />

        {mode == "lp" && (
          <AmountInput
            amount={secondAmount}
            setAmount={setSecondAmount}
            currency={secondCurrency}
            setCurrency={setSecondCurrency}
            showCurrencyDropdown={showSecondCurrencyDropdown}
            setShowCurrencyDropdown={setShowSecondCurrencyDropdown}
            strategy={strategy}
            isLoadingBalance={isLoadingSecondBalance}
            isSupportedChain={isSupportedChain}
            maxBalance={secondMaxBalance}
            handleSetMax={handleSetMax}
          />
        )}

        {/* Advanced Settings */}
        <div className="my-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex justify-end gap-x-2 items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <span>Advanced Settings</span>
            <svg
              className={`size-4 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Max Slippage</span>
                <button
                  type="button"
                  onClick={() => setSlippage("auto")}
                  className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Auto
                </button>
              </div>

              <div className="flex items-center gap-1 bg-[#5F79F1]/10 rounded-lg p-1">
                {["auto", "0.1", "0.5", "1.0"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSlippage(value === "auto" ? "auto" : Number(value));
                      if (value !== "custom") setCustomSlippage("");
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      (value === "auto" && slippage === "auto") ||
                      (value !== "auto" && slippage === Number(value))
                        ? "bg-[#5F79F1] text-white"
                        : "text-black hover:bg-[#5F79F1]/20"
                    }`}
                  >
                    {value === "auto" ? "Auto" : `${value}%`}
                  </button>
                ))}
                <div className="relative flex-1 xl:max-w-[80px]">
                  <input
                    type="text"
                    value={customSlippage}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setCustomSlippage(val);
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          setSlippage(num);
                        } else if (val === "") {
                          setSlippage("auto");
                        }
                      }
                    }}
                    onFocus={() =>
                      setSlippage(
                        customSlippage
                          ? parseFloat(customSlippage) || "auto"
                          : "auto"
                      )
                    }
                    placeholder="1.5%"
                    className="w-full px-3 py-1.5 text-sm text-right bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5F79F1] focus:border-[#5F79F1]"
                  />
                </div>
              </div>
            </div>
          )}
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
      <div className="hidden">
        <DepositDialog
          token={currency}
          open={isDeposit}
          onOpenChange={setIsDeposit}
        />
      </div>
    </>
  );
};

interface AmountInputProps {
  amount: string;
  setAmount: (amount: string) => void;
  currency: Token;
  setCurrency: (currency: Token) => void;
  showCurrencyDropdown: boolean;
  setShowCurrencyDropdown: (show: boolean) => void;
  strategy: StrategyMetadata;
  isLoadingBalance: boolean;
  isSupportedChain: boolean;
  maxBalance: bigint;
  handleSetMax: () => void;
}

const AmountInput = ({
  amount,
  setAmount,
  currency,
  setCurrency,
  showCurrencyDropdown,
  setShowCurrencyDropdown,
  strategy,
  isLoadingBalance,
  isSupportedChain,
  maxBalance,
  handleSetMax,
}: AmountInputProps) => {
  return (
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
  );
};

export default InvestmentForm;
