import { useState } from "react";
import { ArrowLeft, ChevronDown, Info, QrCodeIcon } from "lucide-react";
import { useChainId } from "wagmi";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Address, formatUnits } from "viem";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { CHAINS } from "@/constants/chains";
import { Token } from "@/types";
import { NetworkSelectView } from "@/components/DepositDialog/NetworkSelectView";
import { AssetSelectView } from "@/components/AssetSelectDialog";
import { createWithdrawFormSchema } from "./types";
import useCurrency from "@/hooks/useCurrency";
import { useAssets } from "@/contexts/AssetsContext";

type WithdrawDialogProps = {
  textClassName?: string;
  token: Token;
};

export function WithdrawDialog({ textClassName, token }: WithdrawDialogProps) {
  const chainId = useChainId();
  const { withdrawAsset } = useAssets();
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [showAssetSelect, setShowAssetSelect] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Token>(token);
  const [currentView, setCurrentView] = useState<"form" | "confirmation">(
    "form"
  );
  const { balance } = useCurrency(selectedAsset);
  const maxBalance = Number(
    formatUnits(balance.amount, selectedAsset.decimals)
  );

  const withdrawFormSchema = createWithdrawFormSchema(maxBalance);
  type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      address: "",
      withdrawalAmount: "",
    },
  });

  const chain = CHAINS.find((chain) => chain.id === chainId);
  const text = textClassName
    ? textClassName
    : "px-3 py-1.5 rounded-lg text-sm text-primary hover:bg-gray-50 transition-colors";

  const handleBackToForm = () => {
    setShowNetworkSelect(false);
    setShowAssetSelect(false);
  };

  const handleAssetSelect = (asset: Token) => {
    setSelectedAsset(asset);
    setShowAssetSelect(false);
    // Reset form when asset changes
    form.reset({
      address: form.getValues("address"),
      withdrawalAmount: "",
    });
  };

  const handleMaxClick = () => {
    form.setValue("withdrawalAmount", maxBalance.toString());
  };

  const onSubmit = async (values: WithdrawFormValues) => {
    withdrawAsset.mutate(
      {
        asset: selectedAsset,
        amount: values.withdrawalAmount,
        to: values.address as Address,
      },
      {
        onSuccess: () => {
          toast.success("Withdrawal successful");
        },
        onError: () => {
          toast.error("Withdrawal failed");
        },
      }
    );

    setCurrentView("confirmation");
  };

  const handleBack = () => {
    setCurrentView("form");
  };

  const calculateFees = () => {
    const amount = parseFloat(form.watch("withdrawalAmount")) || 0;
    const feePercentage = 0.001; // 0.1%
    const networkFee = 0.000001; // Example ETH network fee
    const fee = amount * feePercentage;
    const total = amount - fee;

    return { fee, networkFee, total };
  };

  const { total } = calculateFees();

  // Show network selection view
  if (showNetworkSelect) {
    return (
      <Dialog>
        <DialogTrigger className={text}>Withdraw</DialogTrigger>
        <DialogContent className="sm:max-w-[650px] w-[95%] max-w-[650px] p-0 bg-[#FEFEFE] border border-[#E5E5E5] rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Select Network</DialogTitle>
          </DialogHeader>
          <NetworkSelectView onBack={handleBackToForm} />
        </DialogContent>
      </Dialog>
    );
  }

  // Show asset selection view
  if (showAssetSelect) {
    return (
      <Dialog>
        <DialogTrigger className={text}>Withdraw</DialogTrigger>
        <DialogContent className="sm:max-w-[650px] w-[95%] max-w-[650px] p-0 bg-[#FEFEFE] border border-[#E5E5E5] rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Select Asset</DialogTitle>
          </DialogHeader>
          <AssetSelectView
            selectedAsset={selectedAsset}
            onAssetSelect={handleAssetSelect}
            onBack={handleBackToForm}
            title="Select Asset"
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger className={text}>Withdraw</DialogTrigger>
      <DialogContent className="sm:max-w-[650px] w-[95%] max-w-[650px] p-0 bg-[#FEFEFE] border border-[#E5E5E5] rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Withdraw {selectedAsset.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center gap-4 p-4 pb-6"
          >
            {/* Header with back button and title */}
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-4">
                {currentView === "confirmation" && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center justify-center w-6 h-6"
                  >
                    <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
                  </button>
                )}
                <h2 className="font-[Manrope] font-semibold text-[22px] leading-[1.27] text-[#404040]">
                  Withdraw {selectedAsset.name}
                </h2>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="flex items-center w-full p-2 px-4 bg-[#FFF2E7] border border-[#FA8F42] rounded">
              <div className="flex items-center pr-3 pl-0 py-[7px]">
                <Info className="w-6 h-6 text-[#FA8F42]" />
              </div>
              <p className="font-[Manrope] font-bold text-[14px] leading-[1.43] tracking-[0.71%] text-[#121312]">
                Make sure the withdrawal address supports{" "}
                {chain?.name || "BSC (BEP20)"}
              </p>
            </div>

            {/* Asset Field */}
            <div className="w-full">
              <div className="flex items-center justify-between w-full gap-2 py-1 mb-1">
                <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                  Asset
                </p>
              </div>
              <div className="w-full bg-[#F8F9FE] border-none rounded-xl p-2 px-4 opacity-80">
                <button
                  type="button"
                  onClick={() => setShowAssetSelect(true)}
                  className="flex items-center justify-between w-full gap-2 py-2"
                >
                  <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A]">
                    {selectedAsset.name}
                  </p>
                  <ChevronDown className="w-6 h-6 text-[#1A1A1A]" />
                </button>
              </div>
            </div>

            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center justify-between w-full gap-2 py-1 mb-1">
                    <FormLabel className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                      {currentView === "form" ? "Address" : "To Address"}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className="w-full bg-[#F8F9FE] border-none rounded-xl p-2 px-4">
                      <div className="flex items-center justify-between w-full gap-2 py-2">
                        <input
                          type="text"
                          placeholder="Enter address"
                          {...field}
                          className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#6C6C6C] bg-transparent border-none outline-none flex-1"
                        />
                        <button type="button" className="p-2 rounded-full">
                          <QrCodeIcon className="w-6 h-6 text-[#1A1A1A]" />
                        </button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Network Field - Clickable */}
            <div className="w-full">
              <div className="flex items-center justify-between w-full gap-2 py-1 mb-1">
                <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                  Network
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNetworkSelect(true)}
                className="w-full bg-[#F8F9FE] border-none rounded-xl p-2 px-4 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between w-full gap-2 py-2">
                  <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A]">
                    {chain?.name || "BNB Smart Chain (BEP20)"}
                  </p>
                  <ChevronDown className="w-6 h-6 text-[#1A1A1A]" />
                </div>
              </button>
            </div>

            {/* Withdrawal Amount Field */}
            <FormField
              control={form.control}
              name="withdrawalAmount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center justify-between w-full gap-2 py-1 mb-1">
                    <FormLabel className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                      Withdrawal Amount
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className="w-full bg-[#F8F9FE] border-none rounded-xl p-2 px-4">
                      <div className="flex items-center justify-between w-full gap-2 py-2">
                        <input
                          type="text"
                          placeholder={`Min 0.00000001 ${selectedAsset.name}`}
                          {...field}
                          className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#6C6C6C] bg-transparent border-none outline-none flex-1"
                        />
                        <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A]">
                          {selectedAsset.name}
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <div className="flex items-center justify-between w-full gap-2 p-4 px-4">
                    <p className="font-[Inter] font-normal text-[12px] leading-[1.33] text-[#121212]">
                      Balance: {maxBalance.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={handleMaxClick}
                      className="font-[Inter] font-medium text-[12px] leading-[1.33] text-[#3568E8]"
                    >
                      Max
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary Section */}
            <div className="w-full bg-[#FEFEFE] border border-[#E5E5E5] rounded-2xl p-2 px-4">
              <div className="flex flex-col w-full">
                {/* Fee Row */}
                <div className="flex items-center justify-between w-full gap-2 py-3">
                  <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                    {currentView === "form" ? "Fees" : "Network Fee"}
                  </p>
                  <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                    {currentView === "form" ? "0.1%" : "0.000001 ETH"}
                  </p>
                </div>

                {/* Total Row */}
                <div className="flex items-center justify-between w-full gap-2 py-3">
                  <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                    {currentView === "form"
                      ? "Total payment"
                      : "Total Withdrawal"}
                  </p>
                  <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A]">
                    {currentView === "form"
                      ? `$${total.toFixed(2)}`
                      : `${total.toFixed(8)} ${selectedAsset.name}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {currentView === "form" && (
              <button
                type="submit"
                className="w-full bg-[#5F79F1] text-white font-[Manrope] font-semibold text-[16px] leading-[1.5] py-3 px-4 rounded-xl hover:bg-[#4A6AE8] transition-colors"
              >
                Continue
              </button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
