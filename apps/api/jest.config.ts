import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['/node_modules/', 'OLD-specs-uuid-snapshot'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // PRD §8.6: 70% de cobertura nos services (regra de negócio).
  // Controllers, DTOs e módulos são exercidos via E2E/integração, não unit.
  collectCoverageFrom: ['modulos/**/*.service.ts', '!**/*.spec.ts'],
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
