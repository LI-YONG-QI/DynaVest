import { useMutation } from "@tanstack/react-query";
import { LoginMethod } from "./utils";

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
