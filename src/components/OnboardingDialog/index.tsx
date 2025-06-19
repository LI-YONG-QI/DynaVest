"use client";

import React from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DepositDialog } from "@/components/DepositDialog";
import { USDC } from "@/constants/coins";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useAssets } from "@/contexts/AssetsContext";

interface OnboardingDialogProps {
  trigger?: React.ReactNode;
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ trigger }) => {
  const { isOnboardingOpen, setIsOnboardingOpen } = useAssets();

  const handleCheckboxChange = (state: CheckedState) => {
    const status = state ? true : false;
    localStorage.setItem(`onboarding-dialog-shown`, status.toString());

    setIsOnboardingOpen(status);
  };

  return (
    <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[800px] w-[95%] max-w-[700px] rounded-[12px] p-0 bg-white border-0 shadow-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Deposit into DynaVest</DialogTitle>
        </DialogHeader>
        <div className="flex flex-row items-center gap-16 p-9 md:p-12">
          {/* Left side - Illustration */}
          <div className="flex-shrink-0 hidden md:block">
            <div className="relative">
              <Image
                src="/onboarding.svg"
                alt="Onboarding Illustration"
                width={191}
                height={233}
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex flex-col justify-between flex-1 h-[233px]">
            {/* Main content */}
            <div>
              <div className="mb-10">
                <h2 className="font-[Manrope] font-medium text-[32px] leading-[1.37] text-black mb-[15px]">
                  Deposit into DynaVest
                </h2>
                <p className="font-[Manrope] font-medium text-[16px] leading-[1.37] text-black">
                  In order to build diversified DeFi portfolio, we have created
                  an AA wallet for you. Make sure to deposit funding to start
                  making DeFi yield!
                </p>
              </div>
            </div>

            {/* Buttons - positioned at bottom to align with image bottom */}
            <div className="flex flex-col gap-[10px] mt-auto">
              <DepositDialog
                token={USDC}
                textClassName="w-full bg-[#5F79F1] text-white rounded-[8px] py-[14px] px-[20px] flex justify-center items-center hover:bg-[#5F79F1]/90 transition-all duration-200"
              />

              <div className="flex flex-col gap-2 justify-center">
                <div className="mt-2 flex flex-row justify-center items-center gap-2">
                  <Checkbox onCheckedChange={handleCheckboxChange} />
                  <Label
                    className="font-[Manrope] font-semibold text-[16px] leading-[1em] text-[#5F79F1] hover:text-[#5F79F1]/80 transition-colors"
                    htmlFor="email"
                  >
                    Don&apos;t show this again
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
