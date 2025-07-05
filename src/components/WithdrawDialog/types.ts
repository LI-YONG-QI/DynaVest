import { z } from "zod";

export const createWithdrawFormSchema = (
  price: number,
  isPriceError: boolean,
  maxBalance: number = 100.0
) =>
  z.object({
    address: z
      .string()
      .min(1, { message: "Address is required" })
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        message: "Invalid Ethereum address format",
      }),
    withdrawalAmount: z
      .string()
      .min(1, { message: "Withdrawal amount is required" })
      .refine(
        (val) => {
          return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
        },
        { message: "Must be a valid positive number" }
      )
      .refine(
        (val) => {
          const amount = parseFloat(val);
          const value = amount * price;

          if (isPriceError) return true; // Not check

          return value >= 0.01;
        },
        { message: "Minimum withdrawal value is 0.01" }
      )
      .refine(
        (val) => {
          const amount = parseFloat(val);
          return amount <= maxBalance;
        },
        { message: "Amount cannot exceed your available balance" }
      ),
  });
