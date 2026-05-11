import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.spec.(t|j)s', '!**/index.(t|j)s'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: { lines: 70 },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@fleetops/utils/datetime$': '<rootDir>/../../../packages/utils/src/datetime.ts',
    '^@fleetops/utils$': '<rootDir>/../../../packages/utils/src/index.ts',
    '^@fleetops/types$': '<rootDir>/../../../packages/types/src/index.ts',
  },
};

export default config;
