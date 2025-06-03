"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Undo2 } from "lucide-react";
import { format } from "date-fns";

import type { Message } from "@/classes/message";
import {
  EditMessage,
  PortfolioMessage,
  BuildPortfolioMessage,
  InvestMessage,
  TextMessage,
  ReviewPortfolioMessage,
  DepositMessage,
  FindStrategiesMessage,
  StrategiesCardsMessage,
} from "@/classes/message";
import useChatbot from "@/hooks/useChatbotResponse";
import { useChat } from "@/contexts/ChatContext";
import {
  PortfolioChatWrapper,
  EditChatWrapper,
  ReviewPortfolioChatWrapper,
  BuildPortfolioChatWrapper,
  InvestmentFormChatWrapper,
  DepositChatWrapper,
  DefiStrategiesCardsChatWrapper,
} from "@/components/ChatWrapper";
import { BotResponse } from "@/types";

import FindStrategiesChatWrapper from "@/components/ChatWrapper/FindStrategiesChatWrapper";
import { arbitrum } from "viem/chains";
import OnboardingDialog from "@/components/OnboardingDialog";
import { useAssets } from "@/contexts/AssetsContext";

export default function Home() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInput, setIsInput] = useState(false);
  const [command, setCommand] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { closeChat } = useChat();
  const { mutateAsync: sendMessage, isPending: loadingBotResponse } =
    useChatbot();
  const { totalValue, tokensQuery } = useAssets();
  const { isPlaceholderData } = tokensQuery;

  const parseBotResponse = (botResponse: BotResponse) => {
    let nextMessage: Message;

    switch (botResponse.type) {
      case "build_portfolio":
        nextMessage = new InvestMessage({
          id: (Date.now() + 1).toString(),
          text: "Invest start",
          sender: "bot",
          timestamp: new Date(),
        });
        break;
      case "question":
        if (!botResponse.data.answer) {
          throw new Error("Invalid bot response data");
        }
        nextMessage = new TextMessage({
          id: (Date.now() + 1).toString(),
          text: botResponse.data.answer,
          sender: "bot",
          timestamp: new Date(),
        });
        break;
      case "strategies":
        const chains = botResponse.data.chain
          ? [botResponse.data.chain]
          : [arbitrum.id];
        const riskLevel = botResponse.data.risk_level || "low";

        nextMessage = new FindStrategiesMessage(
          {
            id: (Date.now() + 1).toString(),
            text: "Find strategies",
            sender: "bot",
            timestamp: new Date(),
          },
          riskLevel,
          chains
        );
        break;
      default:
        throw new Error("Invalid bot response type");
    }

    return nextMessage;
  };

  const addBotMessage = async (message: Message) => {
    await handleTypingText(message);
    setConversation((prev) => [...prev, message]);
  };

  const addUserMessage = (message: string) => {
    if (message === "") return;
    const userMessage: Message = new TextMessage({
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    });

    setConversation((prev) => [...prev, userMessage]);
    setCommand("");
  };

  /// HANDLE FUNCTIONS ///
  const handleHotTopic = (topic: string) => {
    setCommand(topic);
    // Focus the input field after setting the command
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleTypingText = async (botMessage: Message) => {
    setIsTyping(true);
    let currentText = "";
    const textToType = botMessage.metadata.text;

    for (let i = 0; i < textToType.length; i++) {
      currentText += textToType[i];
      setTypingText(currentText);
      // Slow down the typing speed
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setIsTyping(false);
    setTypingText("");
  };
  // Handle key press in input field
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command.trim() !== "") {
      e.preventDefault();
      handleMessage(command);
    }
  };

  const renderBotMessageContent = (message: Message) => {
    if (message instanceof InvestMessage) {
      return (
        <InvestmentFormChatWrapper
          message={message}
          addBotMessage={addBotMessage}
        />
      );
    } else if (message instanceof PortfolioMessage) {
      return (
        <PortfolioChatWrapper message={message} addBotMessage={addBotMessage} />
      );
    } else if (message instanceof BuildPortfolioMessage) {
      return <BuildPortfolioChatWrapper message={message} />;
    } else if (message instanceof EditMessage) {
      return (
        <EditChatWrapper message={message} addBotMessage={addBotMessage} />
      );
    } else if (message instanceof ReviewPortfolioMessage) {
      return (
        <ReviewPortfolioChatWrapper
          message={message}
          addBotMessage={addBotMessage}
        />
      );
    } else if (message instanceof DepositMessage) {
      return (
        <DepositChatWrapper message={message} addBotMessage={addBotMessage} />
      );
    } else if (message instanceof FindStrategiesMessage) {
      return (
        <FindStrategiesChatWrapper
          message={message}
          addBotMessage={addBotMessage}
        />
      );
    } else if (message instanceof StrategiesCardsMessage) {
      return <DefiStrategiesCardsChatWrapper message={message} />;
    }
  };

  const handleMessage = async (userInput: string) => {
    addUserMessage(userInput);

    try {
      const botResponse = await sendMessage(userInput);
      const nextMessage = parseBotResponse(botResponse);

      await handleTypingText(nextMessage);
      setConversation((prev) => [...prev, nextMessage]);
    } catch (error) {
      console.error(error);
      setConversation((prev) => [
        ...prev,
        new TextMessage({
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't process your request. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        }),
      ]);
    }
  };

  // Scroll to bottom of messages when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  useEffect(() => {
    const latestBotMessages = conversation.filter(
      (message) => message.metadata.sender === "bot"
    );
    const latestBotMessage = latestBotMessages[latestBotMessages.length - 1];

    setIsInput(latestBotMessage instanceof TextMessage);
  }, [conversation]);

  useEffect(() => {
    closeChat();
  }, []);

  useEffect(() => {
    if (isPlaceholderData) {
      setIsOnboardingOpen(false);
    } else {
      if (totalValue === 0) {
        setIsOnboardingOpen(true);
      } else {
        setIsOnboardingOpen(false);
      }
    }
  }, [totalValue, isPlaceholderData]);

  return (
    <div className="h-[80vh]">
      <div
        className={`flex flex-col ${
          conversation.length > 0 ? "flex-1" : "h-full"
        }`}
      >
        {conversation.length === 0 ? (
          <>
            {/* Welcome Message and Options UI based on Figma design */}
            <div className="flex flex-col gap-10 w-full max-w-[805px] mx-auto px-4 md:px-0">
              {/* Welcome Message */}
              <div className="w-full">
                <div className="text-[#17181C] rounded-[0px_10px_10px_10px] p-4 ">
                  <h2 className="font-[Manrope] font-extrabold text-lg mb-2">
                    👋 Welcome to DynaVest Bot!
                  </h2>
                  <p className="font-[Manrope] font-medium text-sm">
                    I&apos;m a DeFi investment bot. Ask me anything about DeFi
                    yield strategies, portfolio management, or use one of our
                    built-in functions below to get started.
                  </p>
                </div>
              </div>

              {/* Built-in Functions */}
              <div className="flex flex-col items-center gap-2.5 w-full max-w-[771px]">
                <p className="font-[Manrope] font-medium text-sm text-center w-full">
                  Choose a built-in function
                </p>
                <div className="flex flex-col md:flex-row justify-stretch gap-4 w-full">
                  <button
                    className="w-full bg-[#5F79F1] text-white rounded-[11px] py-3 px-4 flex justify-center items-center"
                    onClick={() =>
                      handleMessage("Build a diversified DeFi Portfolio")
                    }
                  >
                    <span className="font-[Manrope] font-semibold text-base text-center">
                      Build a diversified DeFi Portfolio
                    </span>
                  </button>
                  <button
                    className="w-full bg-[#5F79F1] text-white rounded-[11px] py-3 px-4 flex justify-center items-center"
                    onClick={() =>
                      handleMessage("Analyze and adjust my DeFi Portfolio")
                    }
                  >
                    <span className="font-[Manrope] font-semibold text-base text-center">
                      Analyze and adjust my DeFi Portfolio
                    </span>
                  </button>
                  <button
                    className="w-full bg-[#5F79F1] text-white rounded-[11px] py-3 px-4 flex justify-center items-center"
                    onClick={() => handleMessage("Deposit into my wallet")}
                  >
                    <span className="font-[Manrope] font-semibold text-base text-center">
                      Deposit into my wallet
                    </span>
                  </button>
                </div>
              </div>

              {/* Hot Topics */}
              <div className="flex-col items-center gap-3.5 w-full max-w-[771px] md:flex hidden">
                <p className="font-[Manrope] font-medium text-sm text-center w-full text-black">
                  Explore hot topics
                </p>
                <div className="flex flex-col w-full gap-4">
                  <button
                    className="w-full bg-[rgba(255,255,255,0.7)] text-black rounded-[14px] py-1.5 px-5 flex items-center gap-1.5"
                    onClick={() =>
                      handleMessage("Help me find the best DeFi strategies")
                    }
                  >
                    <span className="font-[Manrope] font-bold text-sm">
                      DeFi Strategy:
                    </span>
                    <span className="font-[Manrope] font-medium text-sm truncate">
                      Help me find the best DeFi strategies
                    </span>
                  </button>
                  <button
                    className="w-full bg-[rgba(255,255,255,0.7)] text-black rounded-[14px] py-1.5 px-5 flex items-center gap-1.5"
                    onClick={() => handleHotTopic("Learn more about DeFi")}
                  >
                    <span className="font-[Manrope] font-bold text-sm">
                      DynaVest Academy:
                    </span>
                    <span className="font-[Manrope] font-medium text-sm truncate">
                      Learn more about DeFi
                    </span>
                  </button>
                  <button
                    className="w-full bg-[rgba(255,255,255,0.7)] text-black rounded-[14px] py-1.5 px-5 flex items-center gap-1.5"
                    onClick={() =>
                      handleHotTopic(
                        "Give me an analysis on current crypto market"
                      )
                    }
                  >
                    <span className="font-[Manrope] font-bold text-sm">
                      Trend:
                    </span>
                    <span className="font-[Manrope] font-medium text-sm truncate">
                      Give me an analysis on current crypto market
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex fixed w-[95%] md:w-[50%] bottom-[75px] md:bottom-5 left-1/2 -translate-x-1/2 gap-4 z-10">
              <div className="flex-1 border border-[rgba(113,128,150,0.5)] bg-white rounded-lg px-5 py-2.5 flex items-center">
                <input
                  ref={inputRef}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 outline-none text-black font-[Manrope] font-medium text-base"
                  placeholder="Ask me anything about DeFi strategies or use the quick commands"
                />
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleMessage(command);
                }}
                disabled={command.trim() === ""}
                className="flex justify-center items-center min-w-[50px] h-[50px] bg-gradient-to-r from-[#AF95E3] to-[#7BA9E9] p-2 rounded-lg disabled:opacity-50 shrink-0"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Chat View */}
            {/* Welcome Message at top of conversation */}
            <div className="w-full max-w-[805px] mx-auto px-4 md:px-0">
              <div className="mx-auto mb-4">
                <div className="text-[#17181C] rounded-[0px_10px_10px_10px] p-4">
                  <h2 className="font-[Manrope] font-extrabold text-lg mb-2">
                    👋 Welcome to DynaVest Bot!
                  </h2>
                  <p className="font-[Manrope] font-medium text-sm">
                    I&apos;m a DeFi investment bot. Ask me anything about DeFi
                    yield strategies, portfolio management, or use one of our
                    built-in functions below to get started.
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 md:px-4 py-6">
                <div className="flex flex-col gap-6 pb-24">
                  {/* Conversion */}
                  {conversation.map((message) => (
                    <div
                      key={message.metadata.id}
                      className={`flex flex-col ${
                        message.metadata.sender === "user"
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] md:max-w-[80%] rounded-2xl py-3 ${
                          message.metadata.sender === "user"
                            ? "bg-white text-black px-4"
                            : "bg-transparent text-gray-800"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {message.metadata.text}
                        </div>

                        {/* Render bot message content by response type */}
                        {renderBotMessageContent(message)}

                        <div
                          className={`text-xs mt-3 ${
                            message.metadata.sender === "user"
                              ? "text-gray-500"
                              : "text-black"
                          }`}
                        >
                          {format(message.metadata.timestamp, "HH:mm")}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading animation or typing effect */}
                  {loadingBotResponse && (
                    <div className="flex justify-start">
                      <div className="bg-[#5F79F1] text-white max-w-[80%] rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Typewriter effect */}
                  {isTyping && typingText && (
                    <div className="flex justify-start">
                      <div className="text-black max-w-[90%] md:max-w-[80%] rounded-2xl py-3">
                        <div className="whitespace-pre-wrap break-words">
                          {typingText}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Command Form Input */}
            <div className="flex flex-col w-[95%] md:w-[50%] gap-4 justify-center items-center fixed bottom-[10px] left-1/2 -translate-x-1/2 z-10">
              <div
                className={`flex w-full gap-4 ${
                  isInput ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex-1 border border-[rgba(113,128,150,0.5)] bg-white rounded-lg px-5 py-2.5 flex items-center">
                  <input
                    ref={inputRef}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 outline-none text-black font-[Manrope] font-medium text-base"
                    placeholder="Ask me anything about DeFi strategies or use the quick commands"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleMessage(command);
                  }}
                  disabled={command.trim() === ""}
                  className="flex justify-center items-center min-w-[50px] h-[50px] bg-gradient-to-r from-[#AF95E3] to-[#7BA9E9] p-2 rounded-lg disabled:opacity-50 shrink-0"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col relative w-[95%] md:w-[70%] gap-4">
                <div className="flex justify-center">
                  {/* Start new chat button  */}
                  <button
                    className={`flex items-center gap-2.5 py-3 px-6 md:py-4 md:px-8 text-[16px] rounded-[11px] self-end ${
                      loadingBotResponse || isTyping
                        ? "bg-[#D3D8F3]"
                        : "bg-[#9EACEB]"
                    } text-[rgba(0,0,0,0.6)]`}
                    disabled={loadingBotResponse || isTyping}
                    onClick={() => {
                      setConversation([]);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Undo2 className="w-5 h-5" />

                    <span className="font-[Plus Jakarta Sans] font-semibold text-sm">
                      Start a new chat
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        <OnboardingDialog
          isOpen={isOnboardingOpen}
          onOpenChange={setIsOnboardingOpen}
        />
      </div>
    </div>
  );
}
