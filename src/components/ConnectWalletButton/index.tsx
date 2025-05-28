import Image from "next/image";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useDisconnect } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import ChainSelector from "../ChainSelector";
import { useAddUser } from "./useAddUser";

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

  const { login } = useLogin({
    onComplete: async (loginResponse) => {
      addUser(loginResponse, {
        onSuccess: (tx) => {
          if (tx) toast.success(`Wallet created successfully: ${tx}`);
        },
        onError: (error) => {
          console.error(error);
          toast.error(`Wallet creation failed: ${error}`);
        },
      });
    },
    onError: (error) => {
      toast.error(`Login failed: ${error}`);
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
    setIsDropdownOpen(!isDropdownOpen);
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
    if (!user) return;
    setAddress(user.smartWallet?.address || null); // TODO: assertion
  }, [user]);

  const backgroundStyle = {
    background:
      "linear-gradient(-86.667deg, rgba(95, 121, 241, 30%) 18%, rgba(253, 164, 175, 30%) 100%)",
  };

  return (
    <div
      className={`relative flex items-center justify-center text-center gap-x-1 ${
        isDropdownOpen ? "rounded-t-[10px]" : "rounded-[10px]"
      } py-3 px-4 w-[175px] md:w-[200px] h-[54px]`}
      style={backgroundStyle}
      ref={dropdownRef}
    >
      <div className="flex items-center max-w-[35%]">
        {/* Chain Selector */}
        <ChainSelector />
      </div>

      {/* Vertical divider */}
      <div className="w-[2px] h-6 bg-white mx-1"></div>

      <button
        disabled={!buttonReady}
        onClick={handleButtonOnClick}
        className="pl-1 cursor-pointer flex items-center justify-between w-full h-full"
      >
        <div className="flex items-center gap-4 w-full">
          {buttonReady ? (
            loggedIn ? (
              <div className="flex items-center justify-between w-full">
                {/* User info with wallet */}
                <div className="flex items-center gap-4">
                  {/* User info */}
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-[14px] text-[#3B446A] tracking-wider">
                      UserName
                    </span>
                    <span className="font-[var(--font-bricolage-grotesque)] text-xs text-black opacity-60">
                      {address?.slice(0, 6) + "..." + address?.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Arrow down icon */}
                <Image
                  src="/dropdown-icons/arrow-down.svg"
                  alt="Arrow Down"
                  width={16}
                  height={16}
                  className={`text-[#3B446A] transition-transform ml-2 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <span className="text-center text-white font-medium text-base">
                  Connect Wallet
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center w-full">
              <span className="text-center text-white font-medium text-base">
                Loading...
              </span>
            </div>
          )}
        </div>
      </button>

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
              {/* History */}
              <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white hover:bg-opacity-10 transition-colors">
                <Image
                  src="/dropdown-icons/history-icon.svg"
                  alt="History"
                  width={20}
                  height={20}
                />
                <span className="font-[var(--font-bricolage-grotesque)] text-xs text-black">
                  History
                </span>
              </button>

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

              {/* Settings */}
              <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white hover:bg-opacity-10 transition-colors">
                <Image
                  src="/dropdown-icons/settings-icon.svg"
                  alt="Settings"
                  width={20}
                  height={20}
                />
                <span className="font-[var(--font-bricolage-grotesque)] text-xs text-black">
                  Settings
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
