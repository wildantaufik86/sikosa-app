import mongoose, { Schema, Document, Types } from "mongoose";

export interface ChatRoomMessage {
  senderId: Types.ObjectId;
  message: string;
  timestamp: Date;
}

export interface ChatRoomDocument extends Document {
  consultationId: Types.ObjectId;
  participants: Types.ObjectId[];
  messages: ChatRoomMessage[];
  status: "active" | "inactive";
}

const chatRoomSchema = new Schema<ChatRoomDocument>({
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: "Consultation", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

export default mongoose.model<ChatRoomDocument>("ChatRoom", chatRoomSchema);
