import { getRiskColor } from "@/utils";
import type { RiskLevel } from "@/types";

export const LegendItem = ({
  color,
  name,
  apy,
  risk,
}: {
  color: string;
  name: string;
  apy: string;
  risk: RiskLevel;
}) => {
  return (
    <div className="flex items-center p-1 gap-1">
      <div className="flex justify-center items-center">
        <div
          className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        <span className="text-[10px] md:text-xs text-[rgba(0,0,0,0.7)]">
          {name}
        </span>
        <span className="text-[10px] md:text-xs text-[rgba(0,0,0,0.7)]">
          {apy}
        </span>
        <span
          className="text-[10px] md:text-xs capitalize"
          style={{
            color: getRiskColor(risk).text,
          }}
        >
          {risk}
        </span>
      </div>
    </div>
  );
};
