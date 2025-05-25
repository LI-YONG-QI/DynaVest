import { useChainId, useSwitchChain } from "wagmi";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";

import { CHAINS } from "@/constants/chains";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";

// Map for shortened chain names
const shortNames: Record<string, string> = {
  Ethereum: "ETH",
  Polygon: "MATIC",
  Arbitrum: "ARB",
  Optimism: "OP",
  Base: "BASE",
  Avalanche: "AVAX",
  "BNB Smart Chain": "BSC",
  "Flow EVM Mainnet": "FLOW",
};

export default function ChainSelector() {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const currentChain =
    CHAINS.find((chain) => chain.id === chainId) || CHAINS[0];

  // Get shortened name or use original if not found in mapping
  const getShortName = (name: string) => shortNames[name] || name;

  const handleSwitchChain = async (chainId: number) => {
    try {
      await switchChainAsync({ chainId });
      toast.success("Switched chain successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to switch chain");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-1 md:px-2 py-1.5 hover:bg-gray-50">
        <Image
          src={currentChain.icon}
          alt={currentChain.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <ChevronDown size={14} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {CHAINS.map((chain) => (
          <DropdownMenuItem
            key={chain.id}
            onClick={() => handleSwitchChain(chain.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
              src={chain.icon}
              alt={chain.name}
              width={16}
              height={16}
              className="rounded-full"
            />
            <span>{getShortName(chain.name)}</span>
            {chain.id === chainId && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
