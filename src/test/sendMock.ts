export const sendMockInvestMessage = async (
  message: string
): Promise<{ result: string }> => {
  // For demo purposes, we're including our mock strategy in the response
  console.log("message", message);
  return {
    result: "build_portfolio",
  };
};

export const sendMockPortfolioMessage = async (
  message: string
): Promise<{ result: string }> => {
  // For demo purposes, we're including our mock strategy in the response
  console.log("send mock portfolio message", message);
  return {
    result: `pie_chart`,
  };
};

export const sendMockChangePercentageMessage = async (
  message: string
): Promise<{ result: string }> => {
  console.log("message", message);
  return {
    result: "edit_portfolio",
  };
};

export const sendMockReviewMessage = async (
  message: string
): Promise<{ result: string }> => {
  console.log("message", message);
  return {
    result: "review_portfolio",
  };
};
