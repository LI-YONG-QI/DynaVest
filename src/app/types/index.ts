// Message type definition for the chatbot

export type MessageStrategy = Record<string, number>;

export type MessageType = "Text" | "Invest" | "Portfolio" | "Edit";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type: MessageType;
}
