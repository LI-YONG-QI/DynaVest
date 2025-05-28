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

const getLoginId = (loginResponse: LoginResponse) => {
  const { user, loginMethod, loginAccount } = loginResponse;
  let loginId: string | undefined;
  switch (loginMethod) {
    case "google":
      loginId = user.google?.email;
      break;
    case "siwe":
      const account = loginAccount as WalletWithMetadata; //! infer login account with siwe
      loginId = account.address;
      break;
  }

  if (!loginId) throw new Error("Add user: login ID not found");
  return loginId;
};

const getAddress = (user: User) => {
  if (!user.smartWallet?.address)
    throw new Error("Add user: address not found");

  return user.smartWallet.address;
};

export const useAddUser = () => {
  const { mutate, mutateAsync, isError, isSuccess, error } = useMutation({
    mutationFn: async (loginResponse: LoginResponse) => {
      const { user, loginMethod } = loginResponse;
      if (!loginMethod) throw new Error("Add user: login method not found");

      const loginId = getLoginId(loginResponse);
      const address = getAddress(user);

      const params: AddUserParams = {
        privy_id: user.id,
        address,
        total_value: 0,
        login_type: loginMethod,
        login_id: loginId,
      };

      const response = await fetch(
        process.env.NEXT_PUBLIC_CHATBOT_URL + "/addUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      return response.json();
    },
  });

  return {
    mutateAsync,
    mutate,
    isError,
    isSuccess,
    error,
  };
};
