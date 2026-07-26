/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^.+/config/env$': '<rootDir>/src/test-support/env-mock.ts',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/src/test-support/file-mock.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.test.json', diagnostics: false },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/test-support/**',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 },
  },
  coverageReporters: ['text', 'lcov', 'json-summary'],
  // A regex instead of a glob: on Windows <rootDir> contains backslashes
  // that micromatch would read as escape characters.
  testRegex: '\\.spec\\.tsx?$',
};
