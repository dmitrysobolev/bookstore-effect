module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: "ts-jest",

  // Test environment
  testEnvironment: "node",

  // Root directory for tests and source files
  rootDir: ".",

  // Test file patterns - only unit tests
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
  ],

  // Files to collect coverage from
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/index.ts",
    "!src/simple-server.ts",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "text-summary", "html", "json", "lcov"],

  // Output directory for coverage reports
  coverageDirectory: "coverage",

  // No setup files for unit tests
  setupFilesAfterEnv: [],

  // Module path mapping for absolute imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  },

  // Transform configuration
  transform: {
    "^.+\\.ts$": "ts-jest",
  },

  // File extensions to consider
  moduleFileExtensions: ["ts", "js", "json"],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/coverage/",
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Maximum number of concurrent test suites
  maxConcurrency: 4,

  // Test timeout (30 seconds)
  testTimeout: 30000,

  // No global setup/teardown for unit tests
  globalSetup: undefined,
  globalTeardown: undefined,

  // Collect coverage only when --coverage flag is used
  collectCoverage: false,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Error on deprecated features
  errorOnDeprecated: true,
};
