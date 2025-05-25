"use client";
import Image from "next/image";

import { useChat } from "@/contexts/ChatContext";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { openChat } = useChat();
  const pathname = usePathname();

  return (
    <div className="">
      {/* DeFAI Strategies Header - only show for /strategies page */}
      {pathname === "/strategies" && (
        <div className="relative flex justify-center mb-6 items-center">
          <h2 className="text-4xl md:text-[48px] font-extrabold text-[#141A21] text-center">
            DeFAI Strategies
          </h2>

          <div className="md:absolute right-0 hidden md:block">
            <button
              onClick={() => openChat()}
              className="bg-[#5F79F1] flex items-center gap-x-2 text-white px-5 py-3 rounded-2xl shadow-[0px_21px_27px_-10px_rgba(71,114,234,0.65)] font-[family-name:var(--font-manrope)] font-medium hover:bg-[#4A64DC] transition-colors z-10"
            >
              <span>
                <Image
                  src="/bot-icon-white.svg"
                  alt="Bot"
                  width={20}
                  height={20}
                  className="text-[#1E3498]"
                />
              </span>
              Ask DynaVest Bot
            </button>
          </div>
        </div>
      )}

      <div className="pt-10 pb-20 md:pb-10">{children}</div>
    </div>
  );
}
