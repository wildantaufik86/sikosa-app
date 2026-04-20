import AppErrorCode from "../constants/appErrorCode";
import { ChatMessage } from "../constants/chatbot.type";
import { NODE_ENV } from "../constants/env";
import { BAD_REQUEST } from "../constants/http";
import appAssert from "../utils/appAssert";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const isTest = NODE_ENV === "test";

export const sendChatToGroq = async (messages: ChatMessage[]) => {
  // ===== VALIDATION =====//
  appAssert(messages, BAD_REQUEST, "Messages is required", AppErrorCode.InvalidPayload);
  appAssert(Array.isArray(messages), BAD_REQUEST, "Messages must be an array", AppErrorCode.InvalidPayload);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `
Kamu adalah asisten virtual bernama "Sika" yang hanya boleh membahas topik terkait psikologi dan kesehatan mental.
Jika pengguna menanyakan hal di luar psikologi, jawab:
"Maaf, saya hanya menjawab hal-hal yang berkaitan dengan psikologi. Ada yang bisa saya bantu?"
Gunakan gaya bahasa lembut, empatik, dan profesional.
`,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (!isTest) {
        console.error("GROQ ERROR:", errText);
      }

      throw new Error("Failed to fetch GROQ");
    }

    const data = await response.json();

    return {
      role: "assistant",
      content: data.choices?.[0]?.message?.content || "Maaf, tidak ada respons dari model.",
    };
  } catch (error) {
    if (!isTest) {
      console.error(error);
    }

    throw new Error("Chatbot service failed");
  }
};
