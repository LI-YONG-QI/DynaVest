"use client";

import Image from "next/image";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useDisconnect } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import ChainSelector from "../ChainSelector";
import { useAddUser } from "./useAddUser";
import CopyButton from "../CopyButton";
import { getLoginId, LoginResponse, AddUserParams } from "./utilts";

export default function ConnectWalletButton() {
  const {
    ready: privyReady,
    authenticated,
    logout,
    linkWallet,
    user,
  } = usePrivy();

  const [address, setAddress] = useState<string | null>(null);
  const { mutate: addUser } = useAddUser();

  const handleLoginComplete = (loginResponse: LoginResponse) => {
    const { user, loginMethod } = loginResponse;

    if (!loginMethod) throw new Error("AddUserError: login method not found");
    const loginId = getLoginId(loginResponse);
    const params: AddUserParams = {
      privy_id: user.id,
      address: user?.smartWallet?.address || "",
      total_value: 0,
      login_type: loginMethod,
      login_id: loginId,
    };

    return params;
  };

  const { login } = useLogin({
    onComplete: async (loginResponse) => {
      const { wasAlreadyAuthenticated, isNewUser, loginMethod } = loginResponse;
      if (wasAlreadyAuthenticated || !loginMethod) return;

      const params = handleLoginComplete(loginResponse);
      if (isNewUser) {
        localStorage.setItem("isNewUser", "true");
        localStorage.setItem("addUserParams", JSON.stringify(params));
        return;
      }

      addUser(params, {
        onSuccess: (tx) => {
          toast.success(`Wallet created successfully: ${tx}`);
        },
        onError: (error) => {
          console.error(error);
          toast.error(`Wallet creation failed: ${error}`);
        },
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // business logic
  const buttonReady = privyReady && !isLoading;
  const loggedIn = privyReady && authenticated && address;

  const handleButtonOnClick = () => {
    if (!buttonReady) return;
    if (!loggedIn) {
      if (authenticated) {
        // User is authenticated but wallet not connected, use linkWallet instead
        linkWallet();
      } else {
        // User is not authenticated, use regular login
        login({
          loginMethods: ["wallet", "google"],
          walletChainType: "ethereum-only",
          disableSignup: false,
        });
      }
      return;
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDropdownOpen(false);
      setIsLoading(true);
      await logout();
      disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  // DROPDOWN - close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user?.smartWallet?.address) return;
    setAddress(user.smartWallet.address);
  }, [user]);

  const backgroundStyle = {
    background:
      "linear-gradient(-86.667deg, rgba(95, 121, 241, 30%) 18%, rgba(253, 164, 175, 30%) 100%)",
  };

  return (
    <div
      className={`relative flex items-center justify-center text-center gap-x-1 ${
        isDropdownOpen ? "rounded-t-[10px]" : "rounded-[10px]"
      } py-2 px-3 w-[150px] md:w-[190px] h-[48px]`}
      style={backgroundStyle}
      ref={dropdownRef}
    >
      <div className="flex items-center max-w-[30%] ml-2">
        {/* Chain Selector */}
        <ChainSelector />
      </div>

      <div
        onClick={handleButtonOnClick}
        className="pl-1 cursor-pointer flex items-center justify-between w-full h-full"
      >
        <div className="flex items-center gap-3 w-full mr-2">
          {buttonReady ? (
            loggedIn ? (
              <div className="flex items-center justify-between w-full">
                {/* User info with wallet */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* User info */}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-bold text-[13px] text-[#3B446A] tracking-wider truncate">
                      UserName
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-[var(--font-bricolage-grotesque)] text-xs text-black opacity-60 leading-none truncate">
                        {address?.slice(0, 4) + "..." + address?.slice(-4)}
                      </span>
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <CopyButton text={address} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow down icon */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-5 h-5 flex-shrink-0 ml-2"
                >
                  <Image
                    src="/dropdown-icons/arrow-down.svg"
                    alt="Arrow Down"
                    width={12}
                    height={12}
                    className={`text-[#3B446A] transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <span className="text-center text-white font-medium text-sm">
                  Connect
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center w-full">
              <span className="text-center text-white font-medium text-sm">
                Loading...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* DROPDOWN */}
      {isDropdownOpen && (
        <div
          className="absolute top-full right-0 w-full rounded-b-[12px] shadow-lg overflow-hidden z-10 transform origin-top-right transition-all duration-200 ease-out"
          style={{
            ...backgroundStyle,
            boxShadow: "0px 4px 20px 0px rgba(96, 167, 255, 0.25)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="w-full">
            {/* Menu items */}
            <div className="w-full">
              {/* Profile */}
              <button
                onClick={() => router.push("/profile")}
                className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <Image
                  src="/dropdown-icons/profile-icon.svg"
                  alt="Profile"
                  width={20}
                  height={20}
                />
                <span className="font-[var(--font-bricolage-grotesque)] text-xs text-black">
                  Profile
                </span>
              </button>

              {/* Disconnect */}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <Image
                  src="/dropdown-icons/logout-icon.svg"
                  alt="Disconnect"
                  width={20}
                  height={20}
                />
                <span className="font-[var(--font-bricolage-grotesque)] text-xs text-[#FF4560]">
                  Disconnect
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
