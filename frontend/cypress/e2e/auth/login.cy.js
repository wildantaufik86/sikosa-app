import { STATUS_CODE } from "../../support/utils/statusCode";

describe("Login fiture", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it("should can login account when credential is valid", () => {
    // mock api login
    cy.intercept("POST", "api/auth/login", {
      statusCode: STATUS_CODE.OK,
      fixture: "auth/login-success.json",
    }).as("loginRequest");

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

  it("should can login account when click enter", () => {
    // mock api login
    cy.intercept("POST", "api/auth/login", {
      statusCode: STATUS_CODE.OK,
      fixture: "auth/login-success.json",
    }).as("loginRequest");

    cy.getByCy("login-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/login");

    cy.getByCy("login-email").type("aidilsikosates@gmail.com").should("have.value", "aidilsikosates@gmail.com");
    cy.getByCy("login-password").type("tes@123{enter}");

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(STATUS_CODE.OK);
      expect(interception.response.body).to.have.property("accessToken");
    });
  });

  it("should cannot login when credential is not valid and show error message", () => {
    // mock api login
    cy.intercept("POST", "api/auth/login", {
      statusCode: STATUS_CODE.UNAUTHORIZED,
      fixture: "auth/login-failed.json",
    }).as("loginRequest");

    cy.getByCy("login-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/login");

    cy.getByCy("login-email").type("tes@gmail.com").should("have.value", "tes@gmail.com");
    cy.getByCy("login-password").type("tes@123").should("have.value", "tes@123");

    cy.getByCy("login-button-submit").should("be.visible").click();
    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(STATUS_CODE.UNAUTHORIZED);
    });

    cy.getByCy("error-message").should("be.visible");
  });

  it("should show message when email is empty", () => {
    cy.getByCy("login-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/login");

    cy.getByCy("login-email").then(($input) => {
      // Pastikan elemen tidak valid
      expect($input[0].checkValidity()).to.be.false;
      // Pastikan validationMessage muncul (browser-defined)
      expect($input[0].validationMessage).to.exist;
    });
    cy.getByCy("login-password").type("tes@123").should("have.value", "tes@123");

    cy.getByCy("login-button-submit").should("be.visible").click();
  });

  it("should show message when password is empty", () => {
    cy.getByCy("login-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/login");

    cy.getByCy("login-email").type("tes@gmail.com").should("have.value", "tes@gmail.com");
    cy.getByCy("login-password").then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.exist;
      cy.log($input[0].validationMessage);
    });

    cy.getByCy("login-button-submit").should("be.visible").click();
  });

  it("should show message when email is not valid", () => {
    cy.getByCy("login-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/login");

    cy.getByCy("login-email")
      .type("user@")
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
        expect($input[0].validationMessage).to.exist;
        cy.log($input[0].validationMessage);
      });
    cy.getByCy("login-password").type("tes@123").should("have.value", "tes@123");

    cy.getByCy("login-button-submit").should("be.visible").click();
  });
});
