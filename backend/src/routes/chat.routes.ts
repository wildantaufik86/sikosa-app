import express from "express";
import { getRoomMessages, getUserChatRooms, sendMessage, updateStatus } from "../controllers/chat.controller";
import authenticate from "../middleware/authenticate";

const chatRoutes = express.Router();

chatRoutes.get("/rooms", getUserChatRooms);
chatRoutes.get("/messages/:roomId", getRoomMessages);
chatRoutes.post("/messages", sendMessage);
chatRoutes.patch("/finish/:roomId", updateStatus);

export default chatRoutes;
