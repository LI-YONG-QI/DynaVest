import { MessageType } from "../app/types";

export const sendMockInvestMessage = async (
  message: string
): Promise<{ result: string; type: MessageType }> => {
  // For demo purposes, we're including our mock strategy in the response
  console.log("message", message);

  return {
    result:
      "We will diversify your token into reputable and secured yield protocols based on your preference.\nWhat's your investment size (Base by default)? ",
    type: "Invest",
  };
};

export const sendMockPortfolioMessage = async (
  message: string
): Promise<{ result: string; type: MessageType }> => {
  // For demo purposes, we're including our mock strategy in the response
  return {
    result: `${message} it is! Final question, what's your Risk/Yield and Airdrop portfolio preference?`,
    type: "Portfolio",
  };
};

export const sendMockChangePercentageMessage = async (
  message: string
): Promise<{ result: string; type: MessageType }> => {
  console.log("message", message);
  return {
    result: " ",
    type: "Edit",
  };
};

export const sendMockReviewMessage = async (
  message: string
): Promise<{ result: string; type: MessageType }> => {
  console.log("message", message);
  return {
    result: " ",
    type: "Portfolio",
  };
};
