import { STATUS_CODE } from "../../support/utils/statusCode";

describe("Consultations feature (with login)", () => {
  beforeEach(() => {
    cy.loginRequest();
    cy.visit("/daftar-layanan");
  });

  it("should be able to submit a consultation request", () => {
    cy.mockGetAllPsikolog();
    cy.mockGetDetailPsikolog();
    cy.mockConsultationRequest();

    cy.getByCy("card-service").should("be.visible");
    cy.getByCy("card-service").first().getByCy("card-service-detail-button").first().click();
    cy.wait("@getDetailPsikolog").its("response.statusCode").should("eq", STATUS_CODE.OK);

    cy.getByCy("chat-button").first().click().getByCy("consultation-submit").first().click();
    cy.wait("@consultationRequest").its("response.statusCode").should("eq", STATUS_CODE.CREATED);

    cy.getByCy("table-consultations").should("be.visible");
    cy.getByCy("table-consultations-status").should("contain.text", "pending");
  });

  it("should cannot be able to submit a consultation request when status consultation is pending", () => {
    cy.mockGetAllPsikolog();
    cy.mockGetDetailPsikolog();
    cy.intercept("GET", "/api/user/consultation/history", {
      statusCode: STATUS_CODE.OK,
      fixture: "consultation/consultation-history.json",
    }).as("getHistoryConsultation");

    cy.getByCy("card-service").should("be.visible");
    cy.getByCy("card-service").first().getByCy("card-service-detail-button").first().click();
    cy.wait("@getDetailPsikolog").its("response.statusCode").should("eq", STATUS_CODE.OK);

    cy.getByCy("chat-button").first().click();

    cy.wait("@getHistoryConsultation").its("response.statusCode").should("eq", STATUS_CODE.OK);

    cy.getByCy("table-consultations").should("be.visible");
    cy.getByCy("table-consultations-status").should("contain.text", "pending");
    cy.getByCy("consultation-submit").should("not.exist");
  });
});

describe("Consultation feature (without login)", () => {
  it("should cannot be able to submit a consultation request when not login", () => {
    cy.visit("/daftar-layanan");
    cy.getByCy("card-service").should("be.visible");
    cy.getByCy("card-service").first().getByCy("card-service-detail-button").first().click();
    cy.location("pathname").should("eq", "/login");
  });
});

describe("Consultation feature (login as psikolog)", () => {
  beforeEach(() => {
    cy.loginAsPsikolog();
    cy.mockGetNotifications();
    cy.location("pathname").should("include", "/psikolog/");
  });

  it("should to show notification of consultation request", () => {
    cy.location("pathname").should("eq", "/psikolog/notifikasi");
    cy.getByCy("notification-card").should("be.visible");
  });

  it("should be able to accept a consultation request", () => {
    cy.mockAcceptConsultation();
    cy.getByCy("notification-card").should("be.visible").first().click();
    cy.getByCy("notification-accept-button").should("be.visible").first().click();
    cy.wait("@acceptConsultation").then((interception) => {
      expect(interception.response.statusCode).to.eq(STATUS_CODE.OK);
      expect(interception.response.body.data.status).to.eq("accepted");
    });
  });

  it("should be able to reject a consultation request", () => {
    cy.mockRejectConsultation();
    cy.getByCy("notification-card").should("be.visible").first().click();
    cy.getByCy("notification-reject-button").should("be.visible").first().click();
    cy.wait("@rejectConsultation").then((interception) => {
      expect(interception.response.statusCode).to.eq(STATUS_CODE.OK);
      expect(interception.response.body.data.status).to.eq("rejected");
    });
  });

  it("should be able to chat between user and psikolog when consultation accepted", () => {
    cy.intercept("GET", `/api/chat/rooms`, {
      fixture: "data/chat-rooms.json",
    }).as("getRooms");

    cy.intercept("GET", `/api/chat/messages/*`, {
      fixture: "data/chat-messages.json",
    }).as("getMessages");

    cy.intercept("POST", `/api/chat/messages`, (req) => {
      req.reply({ statusCode: 200, body: req.body });
    }).as("postMessage");

    cy.visit("/psikolog/messages", {
      onBeforeLoad(win) {
        // Buat mock socket dengan emit yang bisa di-track
        const mockSocket = {
          emit: cy.spy().as("socketEmit"),
          on: cy.spy().as("socketOn"),
          off: cy.spy().as("socketOff"),
          disconnect: cy.spy(),
        };

        win.io = () => mockSocket;
        win._mockSocket = mockSocket;
      },
    });

    cy.wait("@getRooms");
    cy.getByCy("room-card").should("be.visible").first().click();
    cy.wait("@getMessages");

    cy.getByCy("chat-input").should("be.visible").type("Halo Aidil, bagaimana kabarmu");
    cy.getByCy("chat-send-button").click();
    cy.wait("@postMessage");

    cy.getByCy("chat-message").first().should("contain", "Halo Aidil, bagaimana kabarmu");
  });

  // it.only("should cannot to chat between user and psikolog when message is emtpy", () => {
  //   let messages = [];
  //   cy.intercept("GET", `/api/chat/rooms`, {
  //     fixture: "data/chat-rooms.json",
  //   }).as("getRooms");

  //   cy.intercept("GET", `/api/chat/messages/*`, (req) => {
  //     req.reply({ statusCode: 200, body: messages });
  //   }).as("getMessages");

  //   cy.intercept("POST", `/api/chat/messages`, (req) => {
  //     req.reply({ statusCode: 200, body: req.body });
  //   }).as("postMessage");

  //   cy.visit("/psikolog/messages", {
  //     onBeforeLoad(win) {
  //       // Buat mock socket dengan emit yang bisa di-track
  //       const mockSocket = {
  //         emit: cy.spy().as("socketEmit"),
  //         on: cy.spy().as("socketOn"),
  //         off: cy.spy().as("socketOff"),
  //         disconnect: cy.spy(),
  //       };

  //       win.io = () => mockSocket;
  //       win._mockSocket = mockSocket;
  //     },
  //   });

  //   cy.wait("@getRooms");
  //   cy.getByCy("room-card").should("be.visible").first().click();
  //   cy.wait("@getMessages");

  //   cy.getByCy("chat-input").should("be.visible").type("");
  //   cy.getByCy("chat-send-button").click();
  //   cy.wait("@postMessage");

  //   cy.getByCy("chat-message").first().should("be.emtpy");
  // });
});
