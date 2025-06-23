import React from "react";
import { CircleCheckBig, ArrowUpRight } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

import { useAssets } from "@/contexts/AssetsContext";

const CreateAccount = () => {
  const { authenticated, linkWallet } = usePrivy();
  const { login } = useAssets();

  const handleLogin = () => {
    if (authenticated) {
      linkWallet();
    } else {
      login({
        loginMethods: ["wallet", "google"],
        walletChainType: "ethereum-only",
        disableSignup: false,
      });
    }
    return;
  };

  return (
    <>
      <div
        onClick={handleLogin}
        className={`flex-1  rounded-[11px] px-[20px] py-[10px] relative border border-[#5F79F1] ${
          authenticated ? "bg-[#5F79F1] text-white" : "bg-white text-black"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <span className="font-[Manrope] font-semibold text-xs">Step 1</span>
            <span className="font-[Manrope] font-semibold text-base">
              Create Account or Login
            </span>
          </div>
          {/* Check Circle Icon */}

          {authenticated ? (
            <div className="flex items-center justify-center text-white">
              <CircleCheckBig />
            </div>
          ) : (
            <div className="flex items-center justify-center text-black">
              <ArrowUpRight />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateAccount;
