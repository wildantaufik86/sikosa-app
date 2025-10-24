import { STATUS_CODE } from "../../support/utils/statusCode";

describe("Register fiture", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
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

  it("should show message when email is emtpy", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.exist;
      cy.log($input[0].validationMessage);
    });
    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("aidil123").should("have.value", "aidil123");
    cy.getByCy("register-confirm-password").type("aidil123").should("have.value", "aidil123");

    cy.getByCy("register-button-submit").should("be.visible").click();
  });

  it("should show message when email is not valid", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email")
      .type("user@")
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false;
        expect($input[0].validationMessage).to.exist;
        cy.log($input[0].validationMessage);
      });
    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("aidil123").should("have.value", "aidil123");
    cy.getByCy("register-confirm-password").type("aidil123").should("have.value", "aidil123");

    cy.getByCy("register-button-submit").should("be.visible").click();
  });

  it("should show message when fullname is empty", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");

    cy.getByCy("register-fullname").then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.exist;
      cy.log($input[0].validationMessage);
    });
    cy.getByCy("register-password").type("aidil123").should("have.value", "aidil123");
    cy.getByCy("register-confirm-password").type("aidil123").should("have.value", "aidil123");

    cy.getByCy("register-button-submit").should("be.visible").click();
  });

  it("should show message when password is empty", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");

    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.exist;
      cy.log($input[0].validationMessage);
    });
    cy.getByCy("register-confirm-password").type("aidil123").should("have.value", "aidil123");

    cy.getByCy("register-button-submit").should("be.visible").click();
  });

  it("should show message when confirm password is empty", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");

    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("aidil123").should("have.value", "aidil123");
    cy.getByCy("register-confirm-password").then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.exist;
      cy.log($input[0].validationMessage);
    });
    cy.getByCy("register-button-submit").should("be.visible").click();
  });

  it("should show message when password less than 6 character", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");
    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("abc12").should("have.value", "abc12");
    cy.getByCy("register-confirm-password").type("abc12").should("have.value", "abc12");

    cy.getByCy("register-button-submit").should("be.visible").click();

    cy.getByCy("error-message").should("be.visible");
  });

  it("should show message when confirm password do not match", () => {
    cy.getByCy("register-button").should("be.visible").click();

    cy.location("pathname").should("eq", "/register");

    cy.getByCy("register-email").type("aidiltes@gmail.com").should("have.value", "aidiltes@gmail.com");
    cy.getByCy("register-fullname").type("muhammad aidil").should("have.value", "muhammad aidil");
    cy.getByCy("register-password").type("123456").should("have.value", "123456");
    cy.getByCy("register-confirm-password").type("abcdefgh").should("have.value", "abcdefgh");

    cy.getByCy("register-button-submit").should("be.visible").click();

    cy.getByCy("error-message").should("be.visible");
  });
});
