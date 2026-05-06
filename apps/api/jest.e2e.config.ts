import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  testTimeout: 30_000,
  moduleNameMapper: {
    '^@fleetops/utils/datetime$': '<rootDir>/../../packages/utils/src/datetime.ts',
    '^@fleetops/utils$': '<rootDir>/../../packages/utils/src/index.ts',
    '^@fleetops/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
};

export default config;
