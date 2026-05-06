'use strict';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': 'warn',
    },
  },
];

module.exports = config;
