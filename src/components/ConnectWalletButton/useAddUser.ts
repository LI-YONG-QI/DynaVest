import {
  OAuthProviderType,
  type WalletWithMetadata,
  type LinkedAccountWithMetadata,
  type User,
} from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";

type LoginMethod =
  | "email"
  | "sms"
  | "siwe"
  | "siws"
  | "farcaster"
  | OAuthProviderType
  | "passkey"
  | "telegram"
  | "custom"
  | `privy:${string}`
  | "guest";

type LoginResponse = {
  user: User;
  isNewUser: boolean;
  wasAlreadyAuthenticated: boolean;
  loginMethod: LoginMethod | null;
  loginAccount: LinkedAccountWithMetadata | null;
};

type AddUserParams = {
  privy_id: string;
  address: string;
  login_type: LoginMethod;
  login_id: string;
  total_value: number;
};

export const useAddUser = () => {
  return useMutation({
    mutationFn: async (params: AddUserParams) => {
      await fetch(process.env.NEXT_PUBLIC_CHATBOT_URL + "/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
    },
  });
};
