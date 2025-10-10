describe("Authenticate fiture", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should created an account when field is valid", () => {
    cy.getByCy("register-button").should("be.visible");
  });
});
