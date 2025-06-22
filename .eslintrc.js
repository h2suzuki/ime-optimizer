module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
    webextensions: true,
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    // Allow console in development files but warn
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Allow any in test files and setup files
    '@typescript-eslint/no-explicit-any': ['warn', {
      ignoreRestArgs: true
    }],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/test/**/*.ts', '**/setup.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};