import { useChainId, useSwitchChain } from "wagmi";
import Image from "next/image";
import { ChevronDown, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

import { CHAINS } from "@/constants/chains";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [searchQuery, setSearchQuery] = useState("");

  const currentChain =
    CHAINS.find((chain) => chain.id === chainId) || CHAINS[0];

  const filteredChains = useMemo(() => {
    if (!searchQuery.trim()) return CHAINS;
    try {
      const regex = new RegExp(searchQuery, "i");
      return CHAINS.filter(
        (chain) =>
          regex.test(chain.name) ||
          regex.test(chain.id.toString()) ||
          (shortNames[chain.name] && regex.test(shortNames[chain.name]))
      );
    } catch {
      return CHAINS;
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getShortName = (name: string) => shortNames[name] || name;

  const handleSwitchChain = async (chainId: number) => {
    try {
      await switchChainAsync({ chainId });
      setSearchQuery(""); // Clear search on chain switch
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

      <DropdownMenuContent
        align="end"
        className="w-48 p-0 overflow-hidden bg-white/90 backdrop-blur-sm divide-y-2 divide-gray-200"
        style={{
          background:
            "linear-gradient(-86.667deg, rgba(95, 121, 241, 0.15) 18%, rgba(253, 164, 175, 0.15) 100%)",
        }}
      >
        <div className="p-2 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chains..."
              className="pl-8 h-9 pr-8 text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto p-2">
          {filteredChains.length > 0 ? (
            filteredChains.map((chain) => (
              <DropdownMenuItem
                key={chain.id}
                onClick={() => handleSwitchChain(chain.id)}
                className={`flex items-center gap-2 rounded-lg cursor-pointer mx-2 px-3 py-2 hover:bg-accent/50 ${
                  chain.id === chainId ? "bg-white" : ""
                }`}
              >
                <Image
                  src={chain.icon}
                  alt={chain.name}
                  width={20}
                  height={20}
                  className="rounded-full w-5 h-5"
                />
                <span className="text-sm">{getShortName(chain.name)}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              No chains found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
