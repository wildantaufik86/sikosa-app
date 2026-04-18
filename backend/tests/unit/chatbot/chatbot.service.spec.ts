import { ChatMessage } from "../../../src/constants/chatbot.type";
import { BAD_REQUEST } from "../../../src/constants/http";
import { sendChatToGroq } from "../../../src/services/chatbot.service";

describe("Chatbot Service - sendChatToGroq", () => {
  const getMockFetch = () => global.fetch as jest.Mock;

  const createMessage = (role: "user" | "assistant" | "system", content: string): ChatMessage => ({ role, content });

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.GROQ_API_KEY = "test-api-key";
    global.fetch = jest.fn();
  });

  // TC-CHATBOT-SVC-01
  test("[TC-CHATBOT-SVC-01] : messages undefined - throw BAD_REQUEST", async () => {
    await expect(sendChatToGroq(undefined as unknown as ChatMessage[])).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Messages is required",
    });
  });

  // TC-CHATBOT-SVC-02
  test("[TC-CHATBOT-SVC-02] : messages bukan array - throw BAD_REQUEST", async () => {
    await expect(sendChatToGroq("invalid" as unknown as ChatMessage[])).rejects.toMatchObject({
      statusCode: BAD_REQUEST,
      message: "Messages must be an array",
    });
  });

  // TC-CHATBOT-SVC-03
  test("[TC-CHATBOT-SVC-03] : messages kosong - tetap call API dan return response", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    const result = await sendChatToGroq([]);

    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual({
      role: "assistant",
      content: "OK",
    });
  });

  // TC-CHATBOT-SVC-04
  test("[TC-CHATBOT-SVC-04] : GROQ success - return assistant reply", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Test reply" } }],
      }),
    });

    const result = await sendChatToGroq([createMessage("user", "Halo")]);

    expect(result).toEqual({
      role: "assistant",
      content: "Test reply",
    });
  });

  // TC-CHATBOT-SVC-05
  test("[TC-CHATBOT-SVC-05] : response tanpa content - return default message", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{}],
      }),
    });

    const result = await sendChatToGroq([createMessage("user", "Halo")]);

    expect(result.content).toBe("Maaf, tidak ada respons dari model.");
  });

  // TC-CHATBOT-SVC-06
  test("[TC-CHATBOT-SVC-06] : response non-200 - throw error", async () => {
    getMockFetch().mockResolvedValue({
      ok: false,
      text: async () => "Error",
    });

    await expect(sendChatToGroq([createMessage("user", "Halo")])).rejects.toThrow("Chatbot service failed");
  });

  // TC-CHATBOT-SVC-07
  test("[TC-CHATBOT-SVC-07] : fetch error - throw error", async () => {
    getMockFetch().mockRejectedValue(new Error("Network error"));

    await expect(sendChatToGroq([createMessage("user", "Halo")])).rejects.toThrow("Chatbot service failed");
  });

  // TC-CHATBOT-SVC-08
  test("[TC-CHATBOT-SVC-08] : payload benar - system + user message terkirim", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    const messages: ChatMessage[] = [createMessage("user", "Test")];

    await sendChatToGroq(messages);

    const fetchCall = getMockFetch().mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);

    expect(body.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "system" }),
        expect.objectContaining({ role: "user", content: "Test" }),
      ])
    );
  });

  // TC-CHATBOT-SVC-09
  test("[TC-CHATBOT-SVC-09] : system prompt selalu di index pertama", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    await sendChatToGroq([createMessage("user", "Hello")]);

    const body = JSON.parse(getMockFetch().mock.calls[0][1].body);

    expect(body.messages[0].role).toBe("system");
  });

  // TC-CHATBOT-SVC-10
  test("[TC-CHATBOT-SVC-10] : API key digunakan - Authorization header benar", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    await sendChatToGroq([createMessage("user", "Hello")]);

    const headers = getMockFetch().mock.calls[0][1].headers;

    expect(headers.Authorization).toBe("Bearer test-api-key");
  });

  // TC-CHATBOT-SVC-11
  test("[TC-CHATBOT-SVC-11] : response panjang - tidak terpotong", async () => {
    const longText = "A".repeat(1000);

    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: longText } }],
      }),
    });

    const result = await sendChatToGroq([createMessage("user", "Test")]);

    expect(result.content.length).toBe(1000);
  });

  // TC-CHATBOT-SVC-12
  test("[TC-CHATBOT-SVC-12] : multiple messages - semua history terkirim", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    const messages: ChatMessage[] = [createMessage("user", "A"), createMessage("assistant", "B"), createMessage("user", "C")];

    await sendChatToGroq(messages);

    const body = JSON.parse(getMockFetch().mock.calls[0][1].body);

    expect(body.messages.length).toBe(messages.length + 1);
  });

  // TC-CHATBOT-SVC-13
  test("[TC-CHATBOT-SVC-13] : role invalid - tetap dikirim ke API", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
    });

    const messages = [{ role: "invalid", content: "Test" }] as any;

    await sendChatToGroq(messages);

    const body = JSON.parse(getMockFetch().mock.calls[0][1].body);

    expect(body.messages).toEqual(expect.arrayContaining([expect.objectContaining({ role: "invalid" })]));
  });

  // TC-CHATBOT-SVC-14
  test("[TC-CHATBOT-SVC-14] : response tidak valid - fallback default message", async () => {
    getMockFetch().mockResolvedValue({
      ok: true,
      json: async () => ({
        unexpected: "structure",
      }),
    });

    const result = await sendChatToGroq([createMessage("user", "Test")]);

    expect(result.content).toBe("Maaf, tidak ada respons dari model.");
  });
});
