// Import React dan pustaka yang diperlukan
import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";

const GROQ_API_KEY = "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"; // Ganti dengan API key Anda yang sebenarnya

const ChatPopup = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Halo! Ada yang bisa saya bantu?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Fungsi untuk scroll otomatis ke bagian bawah
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom(); // Panggil fungsi setiap kali messages diperbarui
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [...messages, userMessage],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil respons dari GROQ API");
      }

      const data = await response.json();
      const botReply = {
        role: "assistant",
        content: data.choices[0].message.content,
      };
      setMessages([...messages, userMessage, botReply]);
    } catch (error) {
      console.error("Error fetching chat completion:", error);
      const errorReply = {
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Coba lagi nanti.",
      };
      setMessages([...messages, userMessage, errorReply]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim()) {
      sendMessage();
    }
  };

  return (
    <section className="fixed bottom-20 right-7 lg:bottom-16 lg:right-36 bg-[#C2E5FF] p-6 rounded-lg sm:w-80 md:w-full sm:max-w-sm md:max-w-lg shadow-lg z-50">
      <div className="flex flex-col space-y-4 overflow-y-auto max-h-80">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <img
              src={
                msg.role === "user"
                  ? "/assets/anonymous.png"
                  : "/assets/anonymous.png"
              }
              alt={msg.role}
              className="w-8 h-8 rounded-full my-auto border bg-white border-white"
            />
            <div
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-[#35A7FF] text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          placeholder="Tulis pesan Anda..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        <button
          onClick={sendMessage}
          className="bg-[#35A7FF] text-white p-3 rounded-full hover:bg-[#5DB9FF]"
        >
          <FaPaperPlane className="text-lg" />
        </button>
      </footer>
    </section>
  );
};

export default ChatPopup;
