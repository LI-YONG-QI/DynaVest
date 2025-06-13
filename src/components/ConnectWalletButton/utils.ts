import {
  OAuthProviderType,
  type WalletWithMetadata,
  type LinkedAccountWithMetadata,
  type User,
} from "@privy-io/react-auth";

export type LoginMethod =
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

export type LoginResponse = {
  user: User;
  isNewUser: boolean;
  wasAlreadyAuthenticated: boolean;
  loginMethod: LoginMethod | null;
  loginAccount: LinkedAccountWithMetadata | null;
};

export const getSmartWalletAddress = (user: User) => {
  if (!user.smartWallet?.address)
    throw new Error("Add user: address not found");

  return user.smartWallet.address;
};

export const getLoginId = (loginResponse: LoginResponse) => {
  const { user, loginMethod, loginAccount } = loginResponse;
  let loginId: string | undefined;
  switch (loginMethod) {
    case "google":
      loginId = user.google?.email;
      break;
    case "siwe":
      //! infer login account with siwe
      const account = loginAccount as WalletWithMetadata;
      loginId = account.address;
      break;
  }

  if (!loginId) throw new Error("Add user: login ID not found");
  return loginId;
};
