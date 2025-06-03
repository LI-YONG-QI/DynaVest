import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { AlertCircleIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddressQRCode from "@/components/AddressQRCode";
import CopyButton from "@/components/CopyButton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useChainId } from "wagmi";
import Image from "next/image";

import { CHAINS } from "@/constants/chains";
export function DepositDialog({ textClassName }: { textClassName?: string }) {
  const { client } = useSmartWallets();
  const chainId = useChainId();
  const address = client?.account?.address;

  const chain = CHAINS.find((chain) => chain.id === chainId);

  const text = textClassName
    ? textClassName
    : "px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-gray-50 transition-colors";

  return (
    <Dialog>
      <DialogTrigger className={text}>Deposit</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">Deposit Funds</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle className="mb-2 text-center font-bold text-xl uppercase tracking-wide">
              Warning !!
            </AlertTitle>
            <AlertDescription>
              <p className=" font-bold text-sm capitalize">
                please check network
              </p>
              <div className="flex items-center gap-2 ">
                <p className="font-bold text-sm capitalize">
                  Current Network: {chain?.name}
                </p>
                <Image
                  src={chain?.icon || ""}
                  alt={chain?.name || ""}
                  width={20}
                  height={20}
                />
              </div>
              <ul className="list-inside list-disc text-sm">
                <li>
                  If you deposit funds on the wrong network, you will lose your
                  funds.
                </li>
              </ul>
            </AlertDescription>
          </Alert>
          <div className="w-full max-w-[250px] mx-auto">
            <AddressQRCode address={address || ""} />
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 w-full">
            <p className="text-sm font-mono truncate max-w-[300px]">
              {address}
            </p>
            <CopyButton text={address || ""} />
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Scan the QR code or copy the address to deposit funds
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
