import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import io from "socket.io-client";
import CONFIG from "../../../config/config";

const SOCKET_URL = import.meta.env.VITE_DEVELOPMENT === "true" ? CONFIG.LOCAL_SOCKET_URL : CONFIG.SOCKET_BASE_URL;

const MessagesPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userData = JSON.parse(sessionStorage.getItem("authUser"));
  const userId = userData?._id;
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected with ID:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch chat rooms
  const fetchChatRooms = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${SOCKET_URL}/api/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const activeRooms = response.data.filter((item) => item.status !== "inactive");
      setChatRooms(activeRooms);
      setFilteredRooms(activeRooms.slice().reverse());
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch chat rooms");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Listen for room updates
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("roomUpdate", (updatedRoom) => {
        setChatRooms((prevRooms) => prevRooms.map((room) => (room._id === updatedRoom._id ? updatedRoom : room)));
      });

      return () => {
        socketRef.current.off("roomUpdate");
      };
    }
  }, []);

  // Handle search filtering
  useEffect(() => {
    const filtered = chatRooms
      .filter(
        (room) =>
          Array.isArray(room.participants) &&
          room.participants.some((p) => p.email?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .slice()
      .reverse();
    setFilteredRooms(filtered);
  }, [searchQuery, chatRooms]);

  // Fetch messages for the selected room
  // Handle selected room and messages
  useEffect(() => {
    if (!selectedRoom) return;

    const fetchRoomMessages = async (roomId) => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) throw new Error("No token found");

        const response = await axios.get(`${SOCKET_URL}/api/chat/messages/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(response.data || []);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      }
    };

    fetchRoomMessages(selectedRoom._id);

    // Join room with error handling
    socketRef.current.emit(
      "joinRoom",
      {
        roomId: selectedRoom._id,
        userId: userId,
      },
      (response) => {
        if (response?.error) {
          console.error("Error joining room:", response.error);
        }
      }
    );

    // Enhanced message listener with deduplication
    const handleReceiveMessage = (newMsg) => {
      if (!newMsg || !newMsg.senderId) return;

      setMessages((prevMessages) => {
        // Check for duplicates using a more reliable method
        const isDuplicate = prevMessages.some(
          (msg) =>
            msg._id === newMsg._id ||
            (msg.senderId._id === newMsg.senderId._id && msg.message === newMsg.message && msg.timestamp === newMsg.timestamp)
        );

        if (!isDuplicate) {
          return [...prevMessages, newMsg];
        }
        return prevMessages;
      });
      scrollToBottom();
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    return () => {
      socketRef.current.off("receiveMessage", handleReceiveMessage);
      socketRef.current.emit("leaveRoom", selectedRoom._id);
    };
  }, [selectedRoom, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !socketRef.current?.connected) return;

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found");
      return;
    }

    const messageData = {
      roomId: selectedRoom._id,
      senderId: {
        _id: userId,
      },
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Optimistic UI update
      const tempMessage = { ...messageData, _id: Date.now().toString() };
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      // Send to backend
      const response = await axios.post(`${SOCKET_URL}/api/chat/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Emit to socket after successful API call
      socketRef.current.emit(
        "sendMessage",
        {
          ...messageData,
          _id: response.data._id,
        },
        (ackResponse) => {
          if (ackResponse?.error) {
            console.error("Error sending message:", ackResponse.error);
          }
        }
      );

      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove the temporary message if sending failed
      setMessages((prev) => prev.filter((msg) => msg._id !== messageData._id));
    }
  };

  const handleFinishChat = async () => {
    if (!selectedRoom) return;

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) throw new Error("No token found");

      await axios.patch(`${SOCKET_URL}/api/chat/finish/${selectedRoom._id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setSelectedRoom((prev) => ({ ...prev, status: "inactive" }));
      setChatRooms((prev) => prev.map((room) => (room._id === selectedRoom._id ? { ...room, status: "inactive" } : room)));

      // Emit room update
      socketRef.current.emit("roomUpdate", {
        roomId: selectedRoom._id,
        status: "inactive",
      });
    } catch (err) {
      console.error("Failed to finish chat:", err);
    }
  };

  return (
    <div className="flex pt-16 lg:pt-0 lg:px-4 h-screen flex-col lg:flex-row">
      {/* Left Container - Chat Rooms List */}
      <div className="w-full lg:w-1/3 pr-4 h-full mb-6 lg:mb-0 border-r border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>

        <div className="mb-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email..."
            className="w-full p-2 pl-10 border border-gray-500 rounded-lg focus:outline-none focus:border-[#35A7FF] text-gray-700"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        <div className="space-y-4 overflow-y-auto h-3/4">
          {loading ? (
            <p className="text-center text-gray-500">Loading chat rooms...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : filteredRooms.length === 0 ? (
            <p className="text-center text-gray-500">No chat rooms found.</p>
          ) : (
            filteredRooms.map((room) => {
              const otherParticipant = room.participants?.find((p) => p._id !== userId);
              return (
                <div
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className={`flex items-center space-x-4 p-2 border-b border-gray-300 hover:bg-gray-100 rounded-lg cursor-pointer ${
                    selectedRoom?._id === room._id ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xl text-white">{otherParticipant?.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{otherParticipant?.email}</h3>
                    <p className="text-sm text-gray-500">Room: {room._id.substring(0, 8)}...</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Container - Chat Messages */}
      <div className="w-full lg:w-2/3 pl-4 flex flex-col h-full overflow-hidden">
        {selectedRoom ? (
          <>
            {/* Header Chat */}
            <div className="flex items-center mb-6 border-b pb-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-lg text-white">
                  {selectedRoom.participants
                    ?.find((p) => p._id !== userId)
                    ?.email?.charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-md font-semibold">{selectedRoom.participants?.find((p) => p._id !== userId)?.email}</h3>
                <p className="text-sm text-green-500">Online</p>
              </div>
              {selectedRoom?.status !== "inactive" && (
                <button
                  onClick={handleFinishChat}
                  className="ml-auto p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Finish Chat
                </button>
              )}
            </div>

            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {selectedRoom.status === "inactive" && (
                <div className="text-center text-gray-500 p-4">This chat has been finished and is no longer active.</div>
              )}

              {messages.map((msg, index) => (
                <div key={msg._id || index} className={`flex ${msg.senderId._id === userId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`p-3 rounded-lg max-w-[70%] shadow ${
                      msg.senderId._id === userId ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <span className="text-xs opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            {selectedRoom?.status !== "inactive" && (
              <div className="flex items-center mt-4 p-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="w-full p-2 border border-gray-500 rounded-lg"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
