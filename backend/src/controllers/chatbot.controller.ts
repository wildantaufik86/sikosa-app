import { NextFunction, Request, Response } from "express";
import AppErrorCode from "../constants/appErrorCode";
import { BAD_REQUEST } from "../constants/http";
import { sendChatToGroq } from "../services/chatbot.service";
import appAssert from "../utils/appAssert";

export const chatController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body;

    appAssert(messages, BAD_REQUEST, "Messages is required", AppErrorCode.InvalidPayload);

    const reply = await sendChatToGroq(messages);

    return res.status(200).json({
      status: "success",
      data: reply,
    });
  } catch (error) {
    next(error);
  }
};
