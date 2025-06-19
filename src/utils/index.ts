import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { RiskLevel } from "@/types";

export const getRiskColor = (risk: RiskLevel) => {
  switch (risk) {
    case "low":
      return { text: "#10B981", bg: "rgba(16, 185, 129, 0.3)" };
    case "medium":
      return { text: "#B9AB15", bg: "rgba(230, 212, 9, 0.3)" };
    case "high":
      return { text: "#E83033", bg: "rgba(232, 48, 51, 0.3)" };
    default:
      return { text: "#6B7280", bg: "#E5E7EB" };
  }
};

export function formatAmount(amount: number) {
  if (amount === 0) return "0";
  if (amount < 0.01) {
    return "<0.01";
  }
  return `${Number(amount.toFixed(2))}`;
}

// TODO: Convert given value to USD
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCoin = (value: number) => {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
  })}`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
