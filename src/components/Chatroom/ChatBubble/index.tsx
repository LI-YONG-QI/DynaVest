import Image from "next/image";
import { format } from "date-fns";
import { Message } from "@/types";

interface ChatBubbleProps {
  message: Message;
  isLoading?: boolean;
}

export default function ChatBubble({
  message,
  isLoading = false,
}: ChatBubbleProps) {
  return (
    <div
      className={`flex flex-col ${
        message.sender === "user" ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`flex items-end mb-1 relative ${
          message.sender === "user" ? "justify-end" : ""
        }`}
      >
        {/* User icons */}
        {message.sender === "bot" && (
          <div className="absolute bottom-[-35px] left-0 z-10 flex-shrink-0 mr-2 order-first bg-[#4558AF] rounded-full p-[5px]">
            <Image
              src="/bot-icon-white.svg"
              alt="Bot"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        )}
        {message.sender === "user" && (
          <div className="flex-shrink-0 ml-2 order-last absolute bottom-[-35px] right-[-10px] z-10">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">
              U
            </div>
          </div>
        )}

        {/* Timestamp */}
        {!isLoading && (
          <div
            className={`absolute bottom-[-25px] text-[10px] mt-1 text-gray-500 ${
              message.sender === "user" ? "right-10" : "left-10"
            }`}
          >
            {format(message.timestamp, "HH:mm")}
          </div>
        )}

        {/* Chat bubble */}
        <div
          className={`relative px-4 py-2 rounded-lg max-w-[250px] ${
            message.sender === "user"
              ? "bg-gray-200 text-gray-800 rounded-br-none"
              : "bg-[#5F79F1] text-white ml-4"
          }`}
        >
          {/* Chat bubble pointer */}
          <div
            className={`absolute bottom-[-8px] ${
              message.sender === "user"
                ? "right-0 border-t-16 border-t-gray-200 border-l-16"
                : "left-0 border-t-16 border-t-[#5F79F1] border-r-16"
            } border-l-transparent border-r-transparent`}
          />
          <p className="text-sm whitespace-pre-wrap">
            {isLoading ? (
              <span className="flex items-center space-x-1 py-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
              </span>
            ) : (
              message.text
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
