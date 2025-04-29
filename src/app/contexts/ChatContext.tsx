"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import { Message } from "@/app/types";

interface ChatContextType {
  showChat: boolean;
  openChat: (firstMessage?: string | Message) => void;
  closeChat: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isMinimized: boolean;
  toggleMinimize: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you with your DeFi investments today?",
      sender: "bot",
      timestamp: new Date(),
      type: "Text",
    },
  ]);

  const [isMinimized, setIsMinimized] = useState(false);

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
    } else {
      setMessages([
        {
          id: "1",
          text: "Hello! How can I help you with your DeFi investments today?",
          sender: "bot",
          timestamp: new Date(),
          type: "Text",
        },
      ]);
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
