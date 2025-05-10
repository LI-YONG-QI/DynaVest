import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";
import { parseUnits } from "viem";

import { Token, InvestStrategy } from "@/types";
// import { getStrategy } from "@/classes/strategies/utils";
import useSwitchChain from "@/hooks/useSwitchChain";
import { useAccountProviderContext } from "@/contexts/AccountContext";
import { MorphoAA } from "@/classes/strategies/morphoAA";

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
  handlePortfolio?: (amount: string) => void;
}

export default function InvestModalButton({
  currency,
  amount,
  strategy,
  handleClose,
  handlePortfolio,
}: InvestModalButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>(
    ButtonState.Pending
  );
  const { kernelAccountClient } = useAccountProviderContext();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { address: user } = useAccount();
  const chainId = useChainId();
  const {
    handleSwitchChain,
    isSupportedChain,
    ready: isWalletReady,
  } = useSwitchChain(strategy.chainId);

  const AMOUNT_LIMIT = 0.01;

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

  const executeStrategy = async () => {
    setIsLoading(true);

    if (user) {
      const strategyHandler = new MorphoAA(chainId, kernelAccountClient!);
      const parsedAmount = parseUnits(amount, currency.decimals);

      try {
        const asset = currency.chains![chainId];

        if (kernelAccountClient?.account?.address) {
          console.log("asset", asset);
          console.log(
            "kernelAccountClient.account.address",
            kernelAccountClient.account.address
          );

          console.log("amount", parsedAmount);

          const result = await strategyHandler.execute(
            kernelAccountClient.account.address,
            asset,
            parsedAmount
          );

          const receipt =
            await kernelAccountClient?.waitForUserOperationReceipt({
              hash: result as `0x${string}`,
            });

          console.log("receipt", receipt);
          console.log("result", receipt.receipt.transactionHash);

          console.log("Execution result:", result);
          toast.success(`Investment successful! ${result}`);
        }

        // let result;

        // if (currency.isNativeToken) {
        //   console.log("native token");
        //   result = await strategyHandler.execute(user, null, parsedAmount);
        // } else {
        //   console.log("token");
        //   result = await strategyHandler.execute(
        //     user,
        //     currency.chains![chainId],
        //     parsedAmount
        //   );
        // }

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
        disabled={isDisabled}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#5F79F1] hover:bg-[#4A64DC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {buttonState}
      </button>
    </>
  );
}
