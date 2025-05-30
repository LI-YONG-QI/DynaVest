import React, { useState, useEffect } from "react";
import { Percent } from "lucide-react";
import { toast } from "react-toastify";
import type { PortfolioItem } from "@/types/portfolio";
import Button from "../Button";

type ChangePercentListProps = {
  items: PortfolioItem[];
  onItemsChange: (items: PortfolioItem[]) => void;
  nextStep: () => void;
  isEditable: boolean;
};

type DisplayItem = {
  id: string;
  name: string;
  allocation: number;
  color?: string;
};

const ChangePercentList = ({
  items,
  onItemsChange,
  nextStep,
  isEditable,
}: ChangePercentListProps) => {
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);

  // Convert items to display format
  useEffect(() => {
    const formatted = items.map((item) => ({
      id: item.id,
      name: item.name,
      allocation: item.allocation,
      color: item.color,
    }));
    setDisplayItems(formatted);
  }, [items]);

  const handleAllocationChange = (id: string, value: string) => {
    if (!isEditable) return;

    if (!/^\d*$/.test(value)) return;

    // Convert to number and limit to 0-100
    const numValue = value === "" ? 0 : Math.min(100, parseInt(value));

    const updatedDisplayItems = displayItems.map((item) =>
      item.id === id ? { ...item, allocation: numValue } : item
    );
    setDisplayItems(updatedDisplayItems);

    // Update the original items with new allocations
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, allocation: numValue };
      }
      return item;
    });

    onItemsChange(updatedItems);
  };

  const reviewChange = () => {
    const totalPercentage = displayItems.reduce(
      (sum, item) => sum + item.allocation,
      0
    );
    if (totalPercentage !== 100) {
      toast.error("The total percentage must equal 100.");
      return;
    }

    nextStep();
  };

  return (
    <div className="w-full flex flex-col items-start gap-7">
      <div className="flex flex-col w-full gap-2">
        {displayItems.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between items-center w-full p-1 gap-5">
              <span className="text-[rgba(0,0,0,0.7)] font-[Manrope] font-medium text-sm">
                {item.name}
              </span>

              <input
                className="bg-white text-center border border-[#CBD5E1] rounded-md py-1.5 px-4.5 w-[72px] text-[#17181C] font-[Inter] text-sm"
                value={item.allocation}
                onChange={(e) =>
                  handleAllocationChange(item.id, e.target.value)
                }
                type="text"
                inputMode="numeric"
              />
            </div>
            {index < displayItems.length - 1 && (
              <div className="w-full h-[1px] bg-[#CAC4D0]"></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <Button
        onClick={reviewChange}
        text="Review Percentage"
        disabled={!isEditable}
        icon={<Percent />}
      />
    </div>
  );
};

export default ChangePercentList;
