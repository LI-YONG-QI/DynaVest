import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddressQRCode from "@/components/AddressQRCode";
import CopyButton from "@/components/CopyButton";

export function DepositDialog({ textClassName }: { textClassName?: string }) {
  const { client } = useSmartWallets();
  const address = client?.account?.address;

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
          <span> Hello </span>
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
