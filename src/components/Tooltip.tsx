import React from "react";

interface TooltipProps {
  description: string;
  className?: string;
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  description,
  className = "",
  maxWidth = "250px",
}) => {
  return (
    <div className={`group relative inline-flex ${className}`}>
      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-solid border-[#6B7280] bg-white cursor-help">
        <span className="text-md font-medium text-[#6B7280]">?</span>
      </div>
      <div
        className="invisible absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 transform whitespace-normal rounded bg-white p-3 text-sm text-gray-800 shadow-lg opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
        style={{ maxWidth, minWidth: "160px" }}
      >
        {description}
        <div className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 transform bg-white"></div>
      </div>
    </div>
  );
};
