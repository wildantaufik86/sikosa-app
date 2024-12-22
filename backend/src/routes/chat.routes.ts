import express from "express";
import { getRoomMessages, getUserChatRooms, sendMessage, updateStatus } from "../controllers/chat.controller";
import authenticate from "../middleware/authenticate";

const chatRoutes = express.Router();

chatRoutes.get("/rooms", authenticate, getUserChatRooms);
chatRoutes.get("/messages/:roomId", authenticate, getRoomMessages);
chatRoutes.post("/messages", authenticate, sendMessage);
chatRoutes.patch("/finish/:roomId", authenticate, updateStatus);

export default chatRoutes;
