module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: "ts-jest",

  // Test environment
  testEnvironment: "node",

  // Root directory for tests and source files
  rootDir: ".",

  // Test file patterns
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/integration/**/*.test.ts",
    "<rootDir>/src/**/*.test.ts",
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

  // Setup files to run before tests
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Different configurations for different test types
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
      setupFilesAfterEnv: [],
      globalSetup: undefined,
      globalTeardown: undefined,
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
      globalSetup: "<rootDir>/tests/global-setup.ts",
      globalTeardown: "<rootDir>/tests/global-teardown.ts",
    },
  ],

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

  // Global setup and teardown
  globalSetup: "<rootDir>/tests/global-setup.ts",
  globalTeardown: "<rootDir>/tests/global-teardown.ts",

  // Collect coverage only when --coverage flag is used
  collectCoverage: false,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Error on deprecated features
  errorOnDeprecated: true,
};
