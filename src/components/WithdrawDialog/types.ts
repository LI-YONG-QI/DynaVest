import { z } from "zod";

export const createWithdrawFormSchema = (maxBalance: number = 100.0) =>
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
          return amount >= 0.00000001;
        },
        { message: "Minimum withdrawal amount is 0.00000001" }
      )
      .refine(
        (val) => {
          const amount = parseFloat(val);
          return amount <= maxBalance;
        },
        { message: "Amount cannot exceed your available balance" }
      ),
  });

