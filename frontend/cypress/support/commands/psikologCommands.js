import { STATUS_CODE } from "../utils/statusCode";

Cypress.Commands.add("loginAsPsikolog", () => {
  // mock api
  cy.intercept("POST", "api/auth/login", {
    statusCode: STATUS_CODE.OK,
    fixture: "auth/login-as-psikolog.json",
  }).as("loginAsPsikolog");

  cy.visit("/");
  cy.getByCy("login-button").should("be.visible").click();

  cy.location("pathname").should("eq", "/login");

  cy.getByCy("login-email").type("aidilpsikolog@gmail.com").should("have.value", "aidilpsikolog@gmail.com");
  cy.getByCy("login-password").type("123456").should("have.value", "123456");

  cy.getByCy("login-button-submit").should("be.visible").click();
  cy.wait("@loginAsPsikolog").then((interception) => {
    expect(interception.response.statusCode).to.eq(STATUS_CODE.OK);
    expect(interception.response.body).to.have.property("accessToken");
  });
  cy.visit("/psikolog/notifikasi");
});
Cypress.Commands.add("mockGetNotifications", () => {
  cy.intercept("GET", "/api/psikolog/notifications", {
    statusCode: STATUS_CODE.OK,
    fixture: "data/psikolog-notifications-consultation.json",
  }).as("getNotifications");

  cy.wait("@getNotifications").its("response.statusCode").should("eq", STATUS_CODE.OK);
});

Cypress.Commands.add("mockAcceptConsultation", () => {
  cy.intercept("PUT", "/api/consultation/*/status", {
    statusCode: STATUS_CODE.OK,
    fixture: "consultation/consultation-accepted.json",
  }).as("acceptConsultation");
});

Cypress.Commands.add("mockRejectConsultation", () => {
  cy.intercept("PUT", "/api/consultation/*/status", {
    statusCode: STATUS_CODE.OK,
    fixture: "consultation/consultation-rejected.json",
  }).as("rejectConsultation");
});
