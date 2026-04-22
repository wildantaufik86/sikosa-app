import chatRoom from "../models/chatRoom";

export const getChatRoomsForUser = (userId: string | undefined) =>
  chatRoom.find({ participants: userId }).populate("participants", "email").sort({ updatedAt: -1 });

export const getChatRoomMessages = async (roomId: string) => {
  const room = await chatRoom.findById(roomId).populate("messages.senderId", "name email");

  return room;
};

export const buildOutgoingMessage = ({ roomId, senderId, message }: { roomId: string; senderId: string; message: string }) => ({
  roomId,
  senderId,
  message,
  timestamp: new Date(),
});

export const finishChatRoom = (roomId: string) => chatRoom.findByIdAndUpdate(roomId, { status: "inactive" }, { new: true });
