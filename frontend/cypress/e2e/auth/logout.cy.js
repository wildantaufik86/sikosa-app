import { STATUS_CODE } from "../../support/utils/statusCode";

describe("Logout fiture", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
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

  it("should can logout account when button logout click", () => {
    cy.getByCy("user-setting-button").should("be.visible").click();
    cy.getByCy("logout-button").should("be.visible").click();
    cy.window().then((win) => {
      const token = win.sessionStorage.getItem("accessToken");
      expect(token).to.not.exist;
    });

    cy.location("pathname").should("eq", "/login"); // pastikan diarahkan ke halaman login
  });

  it("should can logout when button logout click many times", () => {
    cy.getByCy("user-setting-button").should("be.visible").click();

    cy.getByCy("logout-button").click({ multiple: true, force: true });
    cy.window().then((win) => {
      const token = win.sessionStorage.getItem("accessToken");
      expect(token).to.not.exist;
    });
    cy.location("pathname", { timeout: 10000 }).should("eq", "/login");
  });

  it("should can logout when logout in other tabs", () => {
    cy.window().then((win) => {
      const token = win.sessionStorage.getItem("accessToken");

      // TAB B (simulasi tab lain)
      cy.visit("/", {
        onBeforeLoad(win2) {
          win2.sessionStorage.setItem("accessToken", token);
        },
      });

      // TAB A logout
      cy.visit("/");
      cy.getByCy("user-setting-button").should("be.visible").click();
      cy.getByCy("logout-button").should("be.visible").click();

      // TAB B coba akses private page → harus diarahkan ke login
      cy.visit("/profile");
      cy.url().should("include", "/login");
    });

    cy.window().then((win) => {
      const token = win.sessionStorage.getItem("accessToken");
      expect(token).to.not.exist;
    });

    cy.location("pathname").should("eq", "/login");
  });

  it("should can't access previous page when already logout", () => {
    cy.visit("/profile");

    cy.getByCy("user-setting-button").should("be.visible").click();
    cy.getByCy("logout-button").should("be.visible").click();

    cy.window().then((win) => {
      const token = win.sessionStorage.getItem("accessToken");
      expect(token).to.not.exist;
    });

    cy.visit("/profile");
    cy.location("pathname").should("eq", "/login");
  });

  it("should can't access page that need access token", () => {
    cy.getByCy("user-setting-button").should("be.visible").click();
    cy.getByCy("logout-button").should("be.visible").click();

    cy.window().then((win) => {
      const token = win.sessionStorage.getItem("accessToken");
      expect(token).to.not.exist;
    });

    cy.visit("/profile");
    cy.location("pathname").should("eq", "/login");
  });
});
