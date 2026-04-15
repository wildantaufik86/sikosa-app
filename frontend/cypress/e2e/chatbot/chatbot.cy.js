import { STATUS_CODE } from "../../support/utils/statusCode";

describe("Chatbot feature", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should provide relevant answers related to psychology", () => {
    // mock groq api
    cy.intercept("POST", "https://api.groq.com/openai/v1/chat/completions", {
      statusCode: STATUS_CODE.OK,
      fixture: "chatbot/chatbot-valid-response.json",
    }).as("mockGroqValidResponse");

    cy.getByCy("chatbot-button").should("be.visible").click();
    cy.getByCy("chatbot-pop-up").should("be.visible");

    // input
    cy.getByCy("chatbot-input").should("be.visible").type("apa itu depresi");
    cy.getByCy("chatbot-send").should("be.visible").click();
    cy.wait("@mockGroqValidResponse");

    // pastikan pesan relevan
    cy.contains(
      "Depresi adalah kondisi mental yang umumnya disebabkan oleh perasaan sedih, kehilangan minat, dan kesulitan menjalankan aktivitas sehari-hari. Orang yang mengalami depresi mungkin merasa putus asa, kehilangan energi, dan memiliki perasaan negatif yang berlebihan."
    ).should("be.visible");
  });

  it("should not answers question whenit should not display a reply message when the input is empty", () => {
    // Pantau semua request ke API Groq
    cy.intercept("POST", "https://api.groq.com/openai/v1/chat/completions").as("groqRequest");

    cy.getByCy("chatbot-button").should("be.visible").click();
    cy.getByCy("chatbot-pop-up").should("be.visible");

    // input
    cy.getByCy("chatbot-input").should("be.visible");
    cy.getByCy("chatbot-send").should("be.visible").click();

    // Tunggu sebentar (karena intercept butuh waktu untuk tahu kalau tidak ada request)
    cy.wait(1000);

    // Pastikan tidak ada request API ke Groq
    cy.get("@groqRequest.all").should("have.length", 0);
  });

  it("should provide a default answer when the question is off-topic", () => {
    // mock groq api
    cy.intercept("POST", "https://api.groq.com/openai/v1/chat/completions", {
      statusCode: STATUS_CODE.OK,
      fixture: "chatbot/chatbot-invalid-response.json",
    }).as("mockGroqInvalidResponse");

    cy.getByCy("chatbot-button").should("be.visible").click();
    cy.getByCy("chatbot-pop-up").should("be.visible");

    // input
    cy.getByCy("chatbot-input").should("be.visible").type("saya ingin bertanya terkait produk apple terbaru");

    cy.getByCy("chatbot-send").should("be.visible").click();
    cy.wait("@mockGroqInvalidResponse");

    // pastikan pesan relevan
    cy.contains("Maaf, saya hanya menjawab hal-hal yang berkaitan dengan psikologi. Ada yang bisa saya bantu?").should(
      "be.visible"
    );
  });
});
