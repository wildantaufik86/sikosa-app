// ChatDokter.js
import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatInput from "../../../components/user/components/chat-dokter/ChatInput";
import DokterDetail from "../../../components/user/components/chat-dokter/DokterDetail";
import PesanChat from "../../../components/user/components/chat-dokter/PesanChat";
import { useAuth } from "../../../hooks/hooks";
import { createPengajuanKonsultasi, getHistoryConsultations, getPsikologById } from "../../../utils/api";
import { toast } from "react-toastify";
import { formattedDate } from "../../../utils/utils";
import axios from "axios";
import io from "socket.io-client";
import CONFIG from "../../../config/config";

const SOCKET_URL = CONFIG.SOCKET_BASE_URL;

console.log(SOCKET_URL);

const ChatDokter = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { id_psikolog } = useParams();
  const [psikolog, setPsikolog] = useState(null);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [statusPengajuan, setStatusPengajuan] = useState({ status: "inactive" });
  const [statusRoom, setStatusRoom] = useState({ status: "inactive" });
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();
  const [roomChat, setRoomChat] = useState(null);

  // Initiate Socket COnnection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    // Clean up socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join chat room when roomChat is set
  useEffect(() => {
    if (roomChat && authUser) {
      socketRef.current.emit("joinRoom", {
        roomId: roomChat,
        userId: authUser._id,
      });
    }
  }, [roomChat, authUser]);

  // Listen for incoming messages
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...newMessage,
            content: newMessage.message,
          },
        ]);
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
        toast.error(error.message);
      });
    }
  }, []);

  // Authentication check
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getPsikologById(id_psikolog);
        if (result.error) {
          throw new Error(result.message);
        }
        setPsikolog(result.data);
      } catch (error) {
        console.error(error.message);
        toast.error("Failed to fetch psychologist data");
      }
    };
    if (authUser) {
      fetchData();
    }
  }, [authUser, id_psikolog]);

  // Fetch chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get(`${SOCKET_URL}/api/chat/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.length > 0) {
          const lastRoom = response.data.slice(-1)[0];
          const dataMessages = lastRoom.messages;
          setMessages(
            dataMessages.map((data) => ({
              ...data,
              content: data.message,
            }))
          );
          setStatusRoom({ status: lastRoom.status });
          setRoomChat(lastRoom._id);
        }
      } catch (err) {
        console.error("Failed to fetch chat rooms:", err);
        toast.error("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    // get consultation data
    const fetchConsultations = async () => {
      try {
        const { error, message, consultations } = await getHistoryConsultations();
        if (error) {
          throw new Error(message);
        }
        const lastConsultation = consultations.slice(-1)[0];
        setStatusPengajuan({ status: lastConsultation.status, createdAt: lastConsultation.createdAt });
      } catch (error) {
        console.log(error);
      }
    };

    if (authUser) {
      fetchChatRooms();
      fetchConsultations();
    }
  }, [authUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      toast.error("No token found. Please log in.");
      return;
    }

    const messageData = {
      roomId: roomChat,
      senderId: authUser._id,
      message: message.trim(),
    };

    try {
      // Send message to backend
      await axios.post(`${SOCKET_URL}/api/chat/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Emit message through socket
      socketRef.current.emit("sendMessage", messageData);

      // Clear input
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const handlePengajuan = async () => {
    const messageInput = "Saya ingin melakukan konsultasi";
    try {
      const { error, message, data } = await createPengajuanKonsultasi({
        message: messageInput,
        psychologistId: id_psikolog,
      });
      if (error) {
        throw new Error(message);
      }
      toast.success(message);
      setStatusPengajuan(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading || !authUser || !psikolog) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

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
        <span className="font-semibold ml-1">{psikolog.profile.fullname}</span>
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
        <DokterDetail psikolog={psikolog} />
        {statusPengajuan?.status === "accepted" && statusRoom.status === "active" ? (
          // Tampilkan chat section jika pengajuan diterima dan status room aktif
          <ChatSection
            message={message}
            messages={messages}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            psikolog={psikolog}
          />
        ) : statusPengajuan?.status === "accepted" && statusRoom.status === "inactive" ? (
          // Tampilkan pengajuan jika pengajuan diterima tetapi status room tidak aktif
          <PengajuanKonsultasi
            statusPengajuan={statusPengajuan}
            psikolog={psikolog}
            handlePengajuan={handlePengajuan}
            authUser={authUser}
          />
        ) : (statusPengajuan?.status === "pending" || statusPengajuan?.status === "inactive") &&
          statusRoom.status === "inactive" ? (
          // Tampilkan pengajuan jika pengajuan masih pending/inactive dan status room tidak aktif
          <PengajuanKonsultasi
            statusPengajuan={statusPengajuan}
            psikolog={psikolog}
            handlePengajuan={handlePengajuan}
            authUser={authUser}
          />
        ) : null}
      </div>
    </div>
  );
};

const PengajuanKonsultasi = ({ handlePengajuan, psikolog, statusPengajuan, authUser }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-x-auto">
      {/* tabel status pengajuan */}
      {statusPengajuan.status !== "not consultation" && (
        <div className="mb-4 w-full overflow-x-auto">
          <table className="min-w-full table-auto border-collapse overflow-x-auto">
            <thead className="bg-[#EBF6FF]">
              <tr>
                <th className="px-4 py-2 font-medium text-left border-y border-gray-200 text-sm">No</th>
                <th className="px-4 py-2 font-medium text-left border-y border-gray-200 text-sm">User</th>
                <th className="px-4 py-2 font-medium text-left border-y border-gray-200 text-sm">Psikolog</th>
                <th className="px-4 py-2 font-medium text-left border-y border-gray-200 text-sm">Status</th>
                <th className="px-4 py-2 font-medium text-left border-y border-gray-200 text-sm">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="px-4 py-2 border-b border-gray-200 text-xs">1</td>
                <td className="px-4 py-2 border-b border-gray-200 text-xs">{authUser.profile.fullname}</td>
                <td className="px-4 py-2 border-b border-gray-200 text-xs">{psikolog.profile.fullname}</td>
                <td
                  className={`px-4 py-2 border-b font-semibold border-gray-200 text-xs ${
                    statusPengajuan.status === "pending"
                      ? "text-yellow-500"
                      : statusPengajuan.status === "accepted"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {statusPengajuan.status}
                </td>
                <td className="px-4 py-2 border-b border-gray-200 text-xs">{formattedDate(statusPengajuan?.createdAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* form pengajuan konsul */}
      {statusPengajuan.status !== "pending" && (
        <div className="w-full bg-white shadow-md rounded-md flex flex-col justify-center items-center py-4 ">
          <h4 className="text-sm md:text-lg mb-2">
            Ajukan konsultasi bersama <span className="text-[#35A7FF]">{psikolog.profile.fullname}</span>
          </h4>
          <button
            onClick={handlePengajuan}
            className="bg-[#35A7FF] hover:bg-[#3297e5] transition-all font-semibold text-white text-xs py-2 px-4 rounded-md md:text-sm"
          >
            Konsultasi
          </button>
        </div>
      )}
    </div>
  );
};

const ChatSection = ({ messages, message, setMessage, handleSendMessage, psikolog }) => {
  return (
    <div className="flex-1 lg:w-2/3 border bg-[#EBF6FF] px-4 py-8 rounded-lg shadow-lg flex flex-col">
      <PesanChat messages={messages} psikolog={psikolog} />
      <ChatInput message={message} setMessage={setMessage} handleSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatDokter;
