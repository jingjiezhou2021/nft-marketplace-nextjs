const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch:[
    "<rootDir>/test/**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testTimeout: 100000000,
};
