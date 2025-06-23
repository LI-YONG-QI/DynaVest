import { useMemo, useState } from "react";
import { ChevronDown, Info, QrCodeIcon } from "lucide-react";
import { useChainId } from "wagmi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Address, formatUnits } from "viem";

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
import useBalance from "@/hooks/useBalance";
import { useAssets } from "@/contexts/AssetsContext";
import { toast } from "react-toastify";

const calculateFees = (amount: number, feePercentage: number = 0.001) => {
  const fee = amount * feePercentage;
  const total = amount - fee;

  return { fee, total };
};

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
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const { balance = BigInt(0) } = useBalance(selectedAsset);

  const maxBalance = useMemo(() => {
    return Number(formatUnits(balance, selectedAsset.decimals));
  }, [balance, selectedAsset.decimals]);

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

  const { total } = calculateFees(
    Number(form.watch("withdrawalAmount")),
    0.005
  );

  const onSubmit = async (values: WithdrawFormValues) => {
    setIsWithdrawing(true);

    withdrawAsset.mutate(
      {
        asset: selectedAsset,
        amount: values.withdrawalAmount,
        to: values.address as Address,
      },
      {
        onSuccess: (tx) => {
          toast.success(`Withdrawal successful ${tx}`);
        },
        onError: (error) => {
          console.log("error", error);
          toast.error("Withdrawal failed");
        },
        onSettled: () => {
          setIsWithdrawing(false);
        },
      }
    );
  };

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
      <DialogContent className="sm:max-w-[650px] w-[95%] max-w-[650px] max-h-[720px] p-0 bg-[#FEFEFE] border border-[#E5E5E5] rounded-xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Withdraw {selectedAsset.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full max-h-[720px]"
          >
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 p-4 pb-0">
              {/* Header with back button and title */}
              <div className="flex items-center justify-between w-full gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="font-[Manrope] font-semibold text-[22px] leading-[1.27] text-[#404040]">
                    Withdraw {selectedAsset.name}
                  </h2>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="flex items-center w-full p-2 px-4 bg-[#FFF2E7] border border-[#FA8F42] rounded mb-4">
                <div className="flex items-center pr-3 pl-0 py-[7px]">
                  <Info className="w-6 h-6 text-[#FA8F42]" />
                </div>
                <p className="font-[Manrope] font-bold text-[14px] leading-[1.43] tracking-[0.71%] text-[#121312]">
                  Make sure the withdrawal address supports{" "}
                  {chain?.name || "BSC (BEP20)"}
                </p>
              </div>
            </div>

            {/* Scrollable Content Section */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="flex flex-col gap-4">
                {/* Asset Field */}
                <div className="w-full">
                  <div className="flex items-center justify-between w-full gap-2 py-1 mb-1">
                    <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                      Asset
                    </p>
                  </div>
                  <div className="w-full bg-[#F8F9FE] border-none rounded-xl p-2 px-4">
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
                          Address
                        </FormLabel>
                      </div>
                      <FormControl>
                        <div className="w-full bg-[#F8F9FE] border-none rounded-xl p-2 px-4">
                          <div className="flex items-center justify-between w-full gap-2 py-2">
                            <input
                              type="text"
                              placeholder="Enter address"
                              {...field}
                              className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A] bg-transparent border-none outline-none flex-1"
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
                    className="w-full bg-[#F8F9FE] border-none rounded-xl p-2 px-4 hover:bg-[#e8f1ff] transition-colors"
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
                              placeholder={`Min 0.01 ${selectedAsset.name}`}
                              {...field}
                              className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A] bg-transparent border-none outline-none flex-1"
                            />
                            <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A]">
                              {selectedAsset.name}
                            </p>
                          </div>
                        </div>
                      </FormControl>
                      <div className="flex items-center justify-between w-full gap-2 p-4 px-4">
                        <p className="font-[Inter] font-normal text-[12px] leading-[1.33] text-[#121212]">
                          Balance: {Number(maxBalance.toFixed(10))}
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
              </div>
            </div>

            {/* Fixed Bottom Section - Summary and Button */}
            <div className="flex-shrink-0 p-4 pt-0">
              <div className="flex flex-col gap-4">
                {/* Summary Section */}
                <div className="w-full bg-[#FEFEFE] border border-[#E5E5E5] rounded-2xl p-2 px-4">
                  <div className="flex flex-col w-full">
                    {/* Fee Row */}
                    <div className="flex items-center justify-between w-full gap-2 py-3">
                      <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                        Fees
                      </p>
                      <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                        0.5%
                      </p>
                    </div>

                    {/* Total Row */}
                    <div className="flex items-center justify-between w-full gap-2 py-3">
                      <p className="font-[Manrope] font-normal text-[14px] leading-[1.43] tracking-[1.79%] text-[#404040]">
                        Total payment
                      </p>
                      <p className="font-[Manrope] font-semibold text-[16px] leading-[1.5] tracking-[0.94%] text-[#1A1A1A]">
                        ${Number(total.toFixed(6))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  type="submit"
                  className="w-full bg-[#5F79F1] text-white font-[Manrope] font-semibold text-[16px] leading-[1.5] py-3 px-4 rounded-xl hover:bg-[#4A6AE8] transition-colors"
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? "Withdrawing..." : "Continue"}
                </button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
