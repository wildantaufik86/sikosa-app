// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { STATUS_CODE } from "./utils/statusCode";
import "./commands/psikologCommands";

Cypress.Commands.add("getByCy", (selector) => {
  cy.get(`[data-cy=${selector}]`);
});

Cypress.Commands.add("loginRequest", () => {
  // mock api
  cy.intercept("POST", "api/auth/login", {
    statusCode: STATUS_CODE.OK,
    fixture: "auth/login-success.json",
  }).as("loginRequest");

  cy.visit("/");
  cy.getByCy("login-button").should("be.visible").click();

  cy.location("pathname").should("eq", "/login");

  cy.getByCy("login-email").type("aidilsikosates@gmail.com").should("have.value", "aidilsikosates@gmail.com");
  cy.getByCy("login-password").type("tes@123").should("have.value", "tes@123");

  cy.getByCy("login-button-submit").should("be.visible").click();
  cy.wait("@loginRequest").then((interception) => {
    expect(interception.response.statusCode).to.eq(STATUS_CODE.OK);
    expect(interception.response.body).to.have.property("accessToken");
  });
});

Cypress.Commands.add("mockConsultationRequest", () => {
  // mock api
  cy.intercept("POST", "api/consultation/apply", {
    statusCode: STATUS_CODE.CREATED,
    fixture: "consultation/consultation-success.json",
  }).as("consultationRequest");
});

Cypress.Commands.add("mockGetAllPsikolog", () => {
  // mock api
  cy.intercept("GET", "/api/user/psikolog/all", {
    statusCode: STATUS_CODE.OK,
    fixture: "data/psikolog-data.json",
  }).as("getAllPsikolog");

  cy.wait("@getAllPsikolog").its("response.statusCode").should("eq", STATUS_CODE.OK);
});

Cypress.Commands.add("mockGetDetailPsikolog", () => {
  // mock api
  cy.intercept("GET", "/api/user/psikolog/*", {
    statusCode: STATUS_CODE.OK,
    fixture: "data/psikolog-detail.json",
  }).as("getDetailPsikolog");
});
