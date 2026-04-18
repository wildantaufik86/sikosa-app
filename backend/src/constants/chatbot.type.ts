export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export interface ChatRequestBody {
  messages: ChatMessage[];
}
