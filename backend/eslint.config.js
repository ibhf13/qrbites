module.exports = [
  {
    // Apply to all JS files
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Common rules
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'semi': ['error', 'always'],
      "quotes": ["error", "single"],
      'indent': ['error', 2],
      'object-curly-spacing': ['error', 'always']
    },
  },
  {
    // Ignore node_modules directory
    ignores: ['node_modules/**', 'coverage/**']
  },
  prettier,
] 