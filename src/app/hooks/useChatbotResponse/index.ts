import { useMutation } from "@tanstack/react-query";

export default function useChatbot() {
  return useMutation({
    mutationFn: async (message: string) => {
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
}
