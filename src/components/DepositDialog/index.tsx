import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useChainId } from "wagmi";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CHAINS } from "@/constants/chains";
import { Token } from "@/types";
import { DepositView } from "./DepositView";
import { NetworkSelectView } from "./NetworkSelectView";

type DepositDialogProps = {
  token: Token;
  textClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DepositDialog({
  textClassName,
  token,
  open: controlledOpen,
  onOpenChange,
}: DepositDialogProps) {
  const { client } = useSmartWallets();
  const chainId = useChainId();
  const address = client?.account?.address;

  const [internalOpen, setInternalOpen] = useState(false);
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);

  const chain = CHAINS.find((chain) => chain.id === chainId);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (!newOpen) {
      setShowNetworkSelect(false);
    }
    onOpenChange?.(newOpen);
  };

  const text = textClassName
    ? textClassName
    : "px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-gray-50 transition-colors";

  const handleBackToDeposit = () => {
    setShowNetworkSelect(false);
  };

  const handleShowNetworkSelect = () => {
    setShowNetworkSelect(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={text}>Deposit</DialogTrigger>
      <DialogContent className="sm:max-w-[650px] w-[95%] max-w-[650px] p-0 bg-[#FEFEFE] border border-[#E5E5E5] rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {showNetworkSelect ? "Select Network" : `Deposit ${token.name}`}
          </DialogTitle>
        </DialogHeader>

        {showNetworkSelect ? (
          <NetworkSelectView onBack={handleBackToDeposit} />
        ) : (
          <DepositView
            token={token}
            address={address}
            chainName={chain?.name}
            onNetworkClick={handleShowNetworkSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
