import React, { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { MoveUpRight } from "lucide-react";
import { MoonLoader } from "react-spinners";
import { parseUnits } from "viem";

import { RiskBadge } from "../../RiskPortfolio";
import InvestmentForm from "../../StrategyList/StrategyCard/InvestModal/InvestmentForm";
import { DepositMessage, Message } from "@/classes/message";
import { USDC } from "@/constants/coins";
import { BOT_STRATEGY } from "@/constants/strategies";
import Button from "@/components/Button";
import AddressQRCode from "@/components/AddressQRCode";

const DEPOSIT_ACTIONS = ["Deposit", "Change Amount"];

interface DepositChatWrapperProps {
  message: DepositMessage;
  addBotMessage: (message: Message) => Promise<void>;
}

const DepositChatWrapper = ({
  message,
  addBotMessage,
}: DepositChatWrapperProps) => {
  const { address } = useAccount();
  const [selectedAction, setSelectedAction] = useState<string>("Deposit");
  const [isDeposit, setIsDeposit] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  const usdc = USDC.chains![message.chain];
  const { data: balance } = useBalance({
    address,
    token: usdc,
    chainId: message.chain,
    query: {
      enabled: !isDeposit,
      refetchInterval: 3 * 1000,
    },
  });

  useEffect(() => {
    if (balance?.value) {
      setIsDeposit(balance.value > BigInt(parseUnits(message.amount, 6)));
    }
  }, [balance, message.amount]);

  const nextMessage = async (action: "build" | "portfolio") => {
    setIsEdit(false);
    await addBotMessage(message.next(action));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="mt-4 text-lg font-bold">Deposit funds to your wallet</p>

      <div className="flex flex-wrap gap-[18px] items-center md:justify-start">
        {DEPOSIT_ACTIONS.map((action) => (
          <RiskBadge
            key={action}
            label={action}
            isSelected={action === selectedAction}
            isEditable={isEdit}
            setSelectedRiskLevel={setSelectedAction}
          />
        ))}
      </div>

      {selectedAction === "Deposit" ? (
        <div className="flex flex-col gap-2 items-center justify-center">
          <AddressQRCode address={address!} />

          <div className="pt-8 flex flex-col gap-4 self-start">
            {isDeposit ? (
              <>
                <p>Deposit successfully</p>
                <Button
                  onClick={() => nextMessage("build")}
                  text="Start Building Portfolio"
                  icon={<MoveUpRight />}
                  disabled={!isEdit}
                />
              </>
            ) : (
              <div className="flex gap-4 self-start">
                <p>Waiting for deposit...</p>
                <MoonLoader color="#5F79F1" size={20} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-[80%]">
          <InvestmentForm
            strategy={{ ...BOT_STRATEGY, chainId: message.chain }}
            chat={{
              handlePortfolio: (amount: string) => {
                message.amount = amount;
                nextMessage("portfolio");
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DepositChatWrapper;
