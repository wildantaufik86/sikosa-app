// Import React dan pustaka yang diperlukan
import { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import CONFIG from "../../../../config/config";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const ChatPopup = () => {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Halo! Ada yang bisa saya bantu?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error("API Error");
      }

      const result = await response.json();

      const botReply = result.data;

      setMessages([...updatedMessages, botReply]);
    } catch (error) {
      console.error(error);

      const errorReply = {
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Coba lagi nanti.",
      };

      setMessages([...updatedMessages, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim()) {
      sendMessage();
    }
  };

  return (
    <section
      data-cy="chatbot-pop-up"
      className="fixed bottom-20 right-7 lg:bottom-16 lg:right-36 bg-[#C2E5FF] p-6 rounded-lg sm:w-80 md:w-full sm:max-w-sm md:max-w-lg shadow-lg z-50"
    >
      <div className="flex flex-col space-y-4 overflow-y-auto max-h-80">
        {messages.map((msg, index) => (
          <div
            data-cy="chatbot-message"
            key={index}
            className={`flex items-start space-x-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <img
              src={msg.role === "user" ? "/assets/anonymous.png" : "/assets/anonymous.png"}
              alt={msg.role}
              className="w-8 h-8 rounded-full my-auto border bg-white border-white"
            />
            <div
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === "user" ? "bg-[#35A7FF] text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="flex items-center space-x-2 mt-4">
        <input
          data-cy="chatbot-input"
          type="text"
          placeholder="Tulis pesan Anda..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        <button
          data-cy="chatbot-send"
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
