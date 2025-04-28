import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";
import { parseUnits } from "viem";

import { Token, InvestStrategy } from "@/app/utils/types";
import { getStrategy } from "@/app/utils/strategies/utils";
import useSwitchChain from "@/app/hooks/useSwitchChain";

enum ButtonState {
  Pending = "Processing...",
  Invest = "Invest",
  SwitchChain = "Switch Chain",
}

interface InvestModalButtonProps {
  currency: Token;
  strategy: InvestStrategy;
  amount: string;
  handleClose?: () => void;
}

export default function InvestModalButton({
  currency,
  amount,
  strategy,
  handleClose,
}: InvestModalButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>(
    ButtonState.Pending
  );
  const [isLoading, setIsLoading] = useState(false);
  const { address: user } = useAccount();
  const chainId = useChainId();
  const {
    handleSwitchChain,
    isSupportedChain,
    ready: isWalletReady,
  } = useSwitchChain(strategy.chainId);

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
  }, [isWalletReady, isLoading, isSupportedChain]);

  const invest = async () => {
    setIsLoading(true);

    if (user) {
      const strategyHandler = getStrategy(strategy.protocol, chainId);
      const parsedAmount = parseUnits(amount, currency.decimals);

      try {
        let result;
        if (currency.isNativeToken) {
          console.log("native token");
          result = await strategyHandler.execute(user, null, parsedAmount);
        } else {
          console.log("token");
          result = await strategyHandler.execute(
            user,
            currency.chains![chainId],
            parsedAmount
          );
        }

        toast.success(`Investment successful! ${result}`);

        if (handleClose) handleClose();
      } catch (error) {
        console.error(error);
        toast.error(`Investment failed! ${error}`);
      }
    }

    setIsLoading(false);
  };

  const handler = () => {
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

  return (
    <>
      <button
        type="button"
        onClick={handler}
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#5F79F1] hover:bg-[#4A64DC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {buttonState}
      </button>
    </>
  );
}
