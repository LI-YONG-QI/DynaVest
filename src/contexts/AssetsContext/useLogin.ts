import { useLogin as usePrivyLogin } from "@privy-io/react-auth";

import {
  getLoginId,
  LoginResponse,
} from "../../components/ConnectWalletButton/utils";
import { type AddUserParams, useAddUser } from "./useAddUser";

const useLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess: (address: string) => void;
  onError: (error: unknown) => void;
}) => {
  const { mutateAsync: addUser } = useAddUser();

  const { login } = usePrivyLogin({
    onComplete: async (loginResponse) => {
      const { wasAlreadyAuthenticated, isNewUser, loginMethod } = loginResponse;

      const handleLoginComplete = (loginResponse: LoginResponse) => {
        const { user, loginMethod } = loginResponse;

        if (!loginMethod)
          throw new Error("AddUserError: login method not found");
        const loginId = getLoginId(loginResponse);
        const params: AddUserParams = {
          privy_id: user.id,
          address: user?.smartWallet?.address || "",
          total_value: 0,
          login_type: loginMethod,
          login_id: loginId,
        };

        return params;
      };

      if (wasAlreadyAuthenticated || !loginMethod) return;

      const params = handleLoginComplete(loginResponse);
      if (isNewUser) {
        localStorage.setItem("isNewUser", "true");
        localStorage.setItem("addUserParams", JSON.stringify(params));
        return;
      }

      await addUser(params);
      onSuccess(params.address);
    },
    onError: (error) => {
      onError(error);
    },
  });

  return {
    login,
  };
};

export default useLogin;
