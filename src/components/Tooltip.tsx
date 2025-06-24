import React from "react";
import Image from "next/image";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/animate-ui/radix/hover-card";
import type { Protocol } from "@/types";

interface TooltipProps {
  description: string;
  protocol: Protocol;
}

export const Tooltip: React.FC<TooltipProps> = ({ protocol, description }) => {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={`flex items-center justify-center size-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors`}
          onClick={(e) => e.preventDefault()}
        >
          <Image src="/question.svg" alt="question" width={24} height={24} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className="w-auto"
        style={{ maxWidth: "250px" }}
      >
        <div className="text-sm text-popover-foreground p-2">
          <div className="flex items-center gap-2">
            <Image
              src={protocol.icon}
              alt={protocol.name}
              width={24}
              height={24}
            />
            <span className="font-medium">{protocol.name}</span>
          </div>
          <div className="mt-2">{description}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
