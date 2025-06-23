import { useMutation } from "@tanstack/react-query";
import { LoginMethod } from "../../components/ConnectWalletButton/utils";

export type AddUserParams = {
  privy_id: string;
  address: string;
  login_type: LoginMethod;
  login_id: string;
  total_value: number;
};

export const useAddUser = () => {
  return useMutation({
    mutationFn: async (params: AddUserParams) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CHATBOT_URL}/user/${params.address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) return params.address;
      const data = await response.json();

      // Check the address if it exists before adding user
      if (!response.ok && data.detail === "User not found") {
        await fetch(`${process.env.NEXT_PUBLIC_CHATBOT_URL}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });
      } else {
        throw new Error(data.detail);
      }

      return params.address;
    },
  });
};
