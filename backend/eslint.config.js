const js = require('@eslint/js')
const globals = require('globals')
const prettier = require('eslint-config-prettier')
const importPlugin = require('eslint-plugin-import')
const promise = require('eslint-plugin-promise')
const sonarjs = require('eslint-plugin-sonarjs')
const security = require('eslint-plugin-security')

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '**/*.test.js',
      '**/__tests__/**',
      '**/*.integration.test.js',
      '**/jest.setup.js',
      '**/__mocks__/**',
      'coverage/**',
      'dist/**',
      'build/**',
    ],
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  promise.configs['flat/recommended'],
  {
    name: 'jest-files',
    files: ['**/*.test.js', '**/__tests__/**', '**/jest.setup.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest },
    },
  },
  {
    name: 'base',
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    plugins: {
      sonarjs,
      security,
    },
    rules: {
      // Base rules
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'object-curly-spacing': ['error', 'always'],
      'import/order': ['error', { 'newlines-between': 'always' }],

      // Promise rules
      'promise/no-nesting': 'warn',

      // SonarJS rules
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-collapsible-if': 'warn',

      // Security rules
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
    },
  },
  prettier,
]
