import { Router } from "express";
import { chatController } from "../controllers/chatbot.controller";

const chatbotRouter = Router();

chatbotRouter.post("/chat", chatController);

export default chatbotRouter;
