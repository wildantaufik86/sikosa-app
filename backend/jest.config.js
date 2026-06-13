const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  rootDir: ".",
  moduleFileExtensions: ["ts", "js", "json"],
  // reporters: ["default"],
  reporters: [
    "<rootDir>/tests/reporters/verbose-reporter.js",

    [
      "jest-html-reporters",
      {
        publicPath: "./reports",
        filename: "integration-report.html",
        expand: true,
      },
    ],
    [
      "jest-stare",
      {
        resultDir: "./reports/jest-stare",
        reportTitle: "SIKOSA Integration Test Report",
        coverageLink: "../../coverage/lcov-report/index.html",
      },
    ],
    [
      "jest-junit",
      {
        outputDirectory: "./reports",
        outputName: "junit.xml",
      },
    ],
  ],
  testMatch: ["**/*.spec.ts", "**/*.integration.spec.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/**/*.integration.spec.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  coverageProvider: "v8",
  setupFiles: ["<rootDir>/tests/setup/env.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/setupTest.ts"],
};
