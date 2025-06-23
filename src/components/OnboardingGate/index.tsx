"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { useAssets } from "@/contexts/AssetsContext";
import CreateAccount from "@/components/StratedSection/CreateAccount";
import YieldPortfolio from "@/components/StratedSection/YieldPortfolio";
import MultiStrategy from "@/components/StratedSection/MultiStrategy";
import SingleStrategy from "@/components/StratedSection/SingleStrategy";
import { Skeleton } from "@/components/ui/skeleton";

const OnboardingSkeleton = () => (
  <div className="flex flex-col gap-2.5 w-full max-w-[771px] mx-auto px-4 md:px-0 mb-10">
    <Skeleton className="h-5 w-1/4 mb-2" />
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <Skeleton className="flex-1 h-[120px]" />
      <Skeleton className="flex-1 h-[120px]" />
    </div>
  </div>
);

const OnboardingGate = ({
  handleMessage,
}: {
  handleMessage: (userInput: string) => Promise<void>;
}) => {
  const [status, setStatus] = useState<
    "loading" | "onboarded" | "not-onboarded"
  >("loading");
  const { smartWallet, isSmartWalletReady } = useAssets();
  const { authenticated, ready } = usePrivy();

  // TODO: conditionally render is too complex
  useEffect(() => {
    if (!ready) return setStatus("loading");

    if (!authenticated) {
      setStatus("not-onboarded");
      return;
    }

    if (isSmartWalletReady) {
      const isOnboarded = localStorage.getItem(`${smartWallet}-is-onboarded`);
      if (isOnboarded === "true") {
        setStatus("onboarded");
      } else {
        setStatus("not-onboarded");
      }
    } else {
      setStatus("loading");
    }
  }, [smartWallet, isSmartWalletReady, authenticated, ready]);

  if (status === "loading") {
    return <OnboardingSkeleton />;
  }

  if (status === "not-onboarded") {
    return (
      <div className="flex flex-col gap-2.5 w-full max-w-[771px] mx-auto px-4 md:px-0">
        <h2 className="font-[Manrope] font-semibold text-sm text-[rgba(0,0,0,0.6)]">
          Get Started
        </h2>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <CreateAccount />
          <YieldPortfolio handleMessage={handleMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-[771px] mx-auto px-4 md:px-0">
      <h2 className="font-[Manrope] font-semibold text-sm text-[rgba(0,0,0,0.6)]">
        Build Yield Portfolio
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        <MultiStrategy handleMessage={handleMessage} />
        <span className="font-[Manrope] font-medium text-sm text-[#999CB3]">
          OR
        </span>
        <SingleStrategy handleMessage={handleMessage} />
      </div>
    </div>
  );
};

export default OnboardingGate;
