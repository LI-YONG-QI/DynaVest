"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { Message, BotResponse } from "@/types";

interface ChatContextType {
  showChat: boolean;
  openChat: (firstMessage?: string | Message) => void;
  closeChat: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isMinimized: boolean;
  toggleMinimize: () => void;
  sendMessage: UseMutationResult<BotResponse, Error, string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // 聊天機器人響應 mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string): Promise<BotResponse> => {
      console.log("CHATBOT MESSAGE", message);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CHATBOT_URL}/defiInfo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({ input_text: message }),
        }
      );
      return res.json();
    },
  });

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const openChat = (firstMessage?: string | Message) => {
    setShowChat(true);
    setIsMinimized(false);

    if (firstMessage) {
      const msgObj: Message =
        typeof firstMessage === "string"
          ? {
              id: Date.now().toString(),
              text: firstMessage,
              sender: "bot",
              timestamp: new Date(),
              type: "Text",
            }
          : firstMessage;
      setMessages([msgObj]);
    }
  };

  const closeChat = () => {
    setShowChat(false);
  };

  return (
    <ChatContext.Provider
      value={{
        showChat,
        openChat,
        closeChat,
        messages,
        setMessages,
        isMinimized,
        toggleMinimize,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
