import { STATUS_CODE } from "../../support/utils/statusCode";

describe("Authenticate fiture", () => {
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

  it("should can register account when field is valid", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");
    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("aidil123").should("have.value", "aidil123");
    cy.getByCy("register-confirm-password").type("aidil123").should("have.value", "aidil123");

    // mock api
    cy.intercept("POST", "api/auth/register", {
      statusCode: STATUS_CODE.CREATED,
      fixture: "auth/register-success.json",
    }).as("registerRequest");

    cy.getByCy("register-button-submit").should("be.visible").click();
    cy.wait("@registerRequest").its("response.body.status").should("eq", "success");
  });

  it("should cannot register when account already use", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");
    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("123456").should("have.value", "123456");
    cy.getByCy("register-confirm-password").type("123456").should("have.value", "123456");

    // mock api
    cy.intercept("POST", "api/auth/register", {
      statusCode: STATUS_CODE.BAD_REQUEST,
      fixture: "auth/register-failed.json",
    }).as("registerRequest");

    cy.getByCy("register-button-submit").should("be.visible").click();
    cy.wait("@registerRequest").its("response.statusCode").should("eq", STATUS_CODE.BAD_REQUEST);
  });

  it("should cannot register when field is not valid and show error message", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");
    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("123456").should("have.value", "123456");
    cy.getByCy("register-confirm-password").type("1234567").should("have.value", "1234567");

    cy.getByCy("register-button-submit").should("be.visible").click();

    cy.getByCy("error-message").should("be.visible");
  });

  it("should can logout account when button logout click", () => {
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

    cy.getByCy("user-setting-button").should("be.visible").click();
    cy.getByCy("logout-button").should("be.visible").click();
    cy.window().then((win) => {
      const token = win.sessionStorage.getItem("accessToken");
      expect(token).to.not.exist; // pastikan tidak ada
    });

    cy.location("pathname").should("eq", "/login"); // pastikan diarahkan ke halaman login
  });
});
