// ChatDokter.js
import React, { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatInput from "../../../components/user/components/chat-dokter/ChatInput";
import DokterDetail from "../../../components/user/components/chat-dokter/DokterDetail";
import PesanChat from "../../../components/user/components/chat-dokter/PesanChat";
import { useAuth } from "../../../hooks/hooks";
import { getPsikologById } from "../../../utils/api";

const doctorData = {
  id: 1,
  name: "Dr. John Doe",
  image: "https://via.placeholder.com/150",
  profile:
    "Dr. John Doe is a specialist in mental health, focusing on anxiety and depression treatment. ",
  education: [
    "S1 Psikologi - Universitas X",
    "S2 Psikologi Klinis - Universitas Y",
  ],
};

const ChatDokter = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { sender: "doctor", content: "Hello, how can I help you today?" },
    { sender: "user", content: "I have been feeling very anxious lately." },
    {
      sender: "doctor",
      content: "I'm here to help. Could you tell me more about your symptoms?",
    },
  ]);
  const { id_psikolog } = useParams();
  const [psikolog, setPsikolog] = useState(null);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getPsikologById(id_psikolog);
        if (result.error) {
          throw new Error(result.message);
        }
        setPsikolog(result.data);
      } catch (error) {
        alert(error.message);
      }
    };
    if (authUser) {
      fetchData();
    }
  }, [authUser, id_psikolog]);

  if (!authUser || !psikolog) {
    return null;
  }

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { sender: "user", content: message }]);
      setMessage("");
    }
  };

  return (
    <div className="py-8 lg:py-10 px-6 lg:px-20 font-jakarta">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-700">
        <Link to="/" className="hover:text-blue-500">
          Beranda
        </Link>
        {" > "}
        <Link to="/daftar-layanan" className="hover:text-blue-500">
          Daftar Layanan
        </Link>
        {" > "}
        <span className="font-semibold ml-1">{doctorData.name}</span>
        {" > "}
        <span className="font-semibold ml-1">Chat Dokter</span>
      </div>

      <Link
        to="/daftar-layanan"
        className="border-2 mb-3 border-black p-2 rounded-full flex items-center justify-center w-10 h-10"
      >
        <FaChevronLeft className="text-black" />
      </Link>

      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
        <DokterDetail doctor={doctorData} psikolog={psikolog} />

        <div className="w-full lg:w-2/3 border bg-[#EBF6FF] px-4 py-8 rounded-lg shadow-lg flex flex-col">
          <PesanChat messages={messages} doctorImage={doctorData.image} />
          <ChatInput
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatDokter;
