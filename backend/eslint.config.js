const { defineConfig } = require('eslint/config')
const js = require('@eslint/js')
const globals = require('globals')
const prettier = require('eslint-config-prettier')
const importPlugin = require('eslint-plugin-import')
const promise = require('eslint-plugin-promise')
const sonarjs = require('eslint-plugin-sonarjs')
const security = require('eslint-plugin-security')

module.exports = defineConfig([
  {
    ignores: [
      'node_modules/**',
      '**/*.test.js',
      '**/__tests__/**',
      'coverage/**',
      'dist/**',
      'build/**',
    ],
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  promise.configs['flat/recommended'],
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    name: 'base',
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'object-curly-spacing': ['error', 'always'],
      'import/order': ['error', { 'newlines-between': 'always' }],
      'promise/no-nesting': 'warn',
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-nested-conditional': 'off',

      // Security rules
      'security/detect-object-injection': 'off',
    },
  },
  prettier,
])
