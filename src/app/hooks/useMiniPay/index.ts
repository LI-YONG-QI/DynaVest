import { useEffect, useState } from "react";
import { getUserAddress } from "./utils";

export const useMiniPay = () => {
  const [address, setAddress] = useState<string | null>(null);

  const getAddress = async () => {
    const address = await getUserAddress();
    if (address) {
      setAddress(address);
    }
  };

  useEffect(() => {
    getAddress();
  }, []);

  return { getUserAddress, address };
};
