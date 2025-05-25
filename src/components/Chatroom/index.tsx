"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Message } from "@/types/message";
import useChatbot from "@/hooks/useChatbotResponse";
import ChatBubble from "./ChatBubble";
import { useChat } from "@/contexts/ChatContext";

const Chatroom = () => {
  const { showChat, messages, setMessages, isMinimized, toggleMinimize } =
    useChat();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: sendMessage, isPending: loadingBotResponse } =
    useChatbot();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showChat && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, showChat, isMinimized]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "Text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      const botResponse = await sendMessage(inputMessage);
      if (!botResponse || !botResponse.type) return;

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.data?.answer ?? "",
        sender: "bot",
        timestamp: new Date(),
        type: "Text",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      // TODO: handle AI error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!showChat) return null;

  {
    /* Minimized Chat - Floating Circle Button */
  }
  if (isMinimized) {
    return (
      <button
        onClick={toggleMinimize}
        className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-50 bg-[#5F79F1] rounded-full p-3 shadow-lg hover:bg-[#4A64DC] transition-colors"
      >
        <Image
          src="/bot-icon-white.svg"
          alt="Chat with DynaVest Bot"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </button>
    );
  }

  return (
    <div className="fixed bg-white bottom-20 md:bottom-6 right-3 md:right-6 rounded-2xl overflow-hidden shadow-2xl z-50 w-full max-w-md h-[500px] flex flex-col">
      {/* Header */}
      <div className="bg-[#5F79F1] text-white flex items-center justify-between px-3 py-2 rounded-t-2xl">
        <div className="flex items-center gap-x-3">
          <button
            onClick={toggleMinimize}
            className="flex items-center justify-center mt-1"
          >
            <Image
              src="/bot-icon-white.svg"
              alt="Bot"
              width={48}
              height={48}
              className="object-contain w-6 h-6"
            />
          </button>
          <div className="leading-5">
            <h3 className="font-bold md:text-lg">DynaVest Bot</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-100">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={toggleMinimize}
          className="flex bg-opacity-20 items-center rounded-full p-1.5 hover:bg-opacity-30 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <>
          <div className="bg-gray-50 p-4 h-[calc(100%-126px)] md:h-[calc(100%-132px)] overflow-y-auto">
            <div className="flex flex-col gap-y-10">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {/* Render loading chat when waiting for bot response */}
              {loadingBotResponse && (
                <ChatBubble
                  message={{
                    id: (Date.now() + 1).toString(),
                    text: "...",
                    sender: "bot",
                    timestamp: new Date(),
                    type: "Text",
                  }}
                  isLoading={true}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-grow relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5F79F1] placeholder:text-xs md:placeholder:text-sm focus:border-transparent resize-none"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ""}
                className="bg-[#5F79F1] text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4A64DC] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatroom;
