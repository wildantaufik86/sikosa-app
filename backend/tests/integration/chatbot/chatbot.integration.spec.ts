import request from "supertest";
import express from "express";

import { sendChatToGroq } from "../../../src/services/chatbot.service";
import { BAD_REQUEST } from "../../../src/constants/http";
import chatbotRouter from "../../../src/routes/chatbot.routes";

jest.mock("../../../src/services/chatbot.service");

const app = express();
app.use(express.json());
app.use("/api/chatbot", chatbotRouter);

// simple error handler (sesuaikan kalau kamu punya global handler)
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message,
  });
});

describe("Chatbot Integration Test - /api/chatbot/chat", () => {
  const mockService = sendChatToGroq as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-CHATBOT-INT-01
  test("[TC-CHATBOT-INT-01] : messages undefined - return BAD_REQUEST", async () => {
    const res = await request(app).post("/api/chatbot/chat").send({});

    expect(res.status).toBe(BAD_REQUEST);
    expect(res.body.message).toBe("Messages is required");
  });

  // TC-CHATBOT-INT-02
  test("[TC-CHATBOT-INT-02] : messages valid - return assistant reply", async () => {
    mockService.mockResolvedValue({
      role: "assistant",
      content: "Test reply",
    });

    const res = await request(app)
      .post("/api/chatbot/chat")
      .send({
        messages: [{ role: "user", content: "Halo" }],
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      role: "assistant",
      content: "Test reply",
    });
  });

  // TC-CHATBOT-INT-03
  test("[TC-CHATBOT-INT-03] : service error - propagate error", async () => {
    mockService.mockRejectedValue({
      statusCode: 500,
      message: "Chatbot service failed",
    });

    const res = await request(app)
      .post("/api/chatbot/chat")
      .send({
        messages: [{ role: "user", content: "Halo" }],
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Chatbot service failed");
  });

  // TC-CHATBOT-INT-04
  test("[TC-CHATBOT-INT-04] : response format - contains status and data", async () => {
    mockService.mockResolvedValue({
      role: "assistant",
      content: "OK",
    });

    const res = await request(app)
      .post("/api/chatbot/chat")
      .send({
        messages: [{ role: "user", content: "Test" }],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "success");
    expect(res.body).toHaveProperty("data");
  });

  // TC-CHATBOT-INT-05
  test("[TC-CHATBOT-INT-05] : multiple messages - success", async () => {
    mockService.mockResolvedValue({
      role: "assistant",
      content: "OK",
    });

    const res = await request(app)
      .post("/api/chatbot/chat")
      .send({
        messages: [
          { role: "user", content: "A" },
          { role: "assistant", content: "B" },
          { role: "user", content: "C" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("assistant");
  });

  // TC-CHATBOT-INT-06
  test("[TC-CHATBOT-INT-06] : empty content from service - still valid response", async () => {
    mockService.mockResolvedValue({
      role: "assistant",
      content: "Maaf, tidak ada respons dari model.",
    });

    const res = await request(app)
      .post("/api/chatbot/chat")
      .send({
        messages: [{ role: "user", content: "Test" }],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe("Maaf, tidak ada respons dari model.");
  });
});
