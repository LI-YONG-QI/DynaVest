import axios from "axios";
import { Address } from "viem";

import { StrategyCall } from "@/classes/strategies/baseStrategy";
import { Protocols } from "@/types/strategies";

import { BaseStrategy } from "@/classes/strategies/baseStrategy";
import { MultiStrategy } from "@/classes/strategies/multiStrategy";
import { Token } from "@/types/blockchain";

type PositionParams = {
  address: Address;
  amount: number;
  token_name: string;
  chain_id: number;
  strategy: string;
};

type PositionResponse = {
  id: string;
  amount: number;
  strategy: string;
  status: string;
};

export async function getRedeemCalls(
  strategy: BaseStrategy<Protocols> | MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number
) {
  let calls: StrategyCall[];

  if (token.isNativeToken) {
    calls = await strategy.redeemCalls(amount, user);
  } else {
    calls = await strategy.redeemCalls(amount, user, token.chains?.[chainId]);
  }

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

export async function getInvestCalls(
  strategy: BaseStrategy<Protocols> | MultiStrategy,
  amount: bigint,
  user: Address,
  token: Token,
  chainId: number
) {
  let calls: StrategyCall[];

  if (token.isNativeToken) {
    calls = await strategy.investCalls(amount, user);
  } else {
    calls = await strategy.investCalls(amount, user, token.chains?.[chainId]);
  }

  if (calls.length === 0) throw new Error("No calls found");
  return calls;
}

export async function updatePosition(positionParams: PositionParams) {
  // TODO: refactor with backend
  const positions = await axios.get(
    `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${positionParams.address}`
  );
  const position = positions.data.find(
    (pos: PositionResponse) =>
      pos.strategy === positionParams.strategy && pos.status === "true"
  );

  if (!position) {
    await axios.post(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/addPosition`,
      positionParams
    );
  } else {
    const newAmount = Number(position.amount) + positionParams.amount;
    await axios.patch(
      `${process.env.NEXT_PUBLIC_CHATBOT_URL}/positions/${position.position_id}`,
      {
        amount: newAmount,
      }
    );
  }
}

export async function updatePositions(
  strategy: MultiStrategy,
  amount: bigint,
  chainId: number,
  user: Address,
  tokenName: string = "USDC"
) {
  for (const singleStrategy of strategy.strategies) {
    const position: PositionParams = {
      address: user,
      amount: Number(
        (amount * BigInt(singleStrategy.allocation)) / BigInt(100)
      ),
      token_name: tokenName,
      chain_id: chainId,
      strategy: singleStrategy.strategy.name,
    };

    try {
      await updatePosition(position);
    } catch (error) {
      console.error("Error adding position:", error);
    }
  }
}
