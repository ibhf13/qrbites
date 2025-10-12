import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import tailwindcss from 'eslint-plugin-tailwindcss'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
    {
        ignores: [
            'dist/*',
            'build/*',
            'node_modules/*',
            'public/*',
            '**/*.md',
        ],
    },
    // Configuration for app source files with strict TypeScript checking
    {
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            react,
            'react-hooks': reactHooks,
            import: importPlugin,
            tailwindcss,
        },
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-non-null-assertion': 'warn',

            // React specific rules
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
            'react/self-closing-comp': ['warn', { component: true, html: true }],


            // General rules
            'no-console': ['off', { allow: ['warn', 'error'] }],
            'no-debugger': 'warn',
            'no-unused-vars': 'off',
            'prefer-const': 'warn',
            'no-var': 'error',
            'object-shorthand': 'warn',
            'eqeqeq': ['warn', 'always'],

            // Spacing and formatting rules
            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                { blankLine: 'always', prev: 'directive', next: '*' },
                { blankLine: 'always', prev: 'block-like', next: '*' }
            ],
            'lines-around-comment': [
                'error',
                {
                    beforeBlockComment: true,
                    beforeLineComment: true,
                    allowBlockStart: true,
                    allowClassStart: true,
                    allowObjectStart: true,
                    allowArrayStart: true,
                }
            ],
            'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
            'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'comma-spacing': ['error', { before: false, after: true }],
        },
    },
    // Configuration for config files (vite.config.ts, etc.) without strict TypeScript project checking
    {
        files: ['*.{js,ts,mjs}', '**/*.config.{js,ts,mjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: false,
                },
                // No project setting for config files to avoid tsconfig include issues
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            import: importPlugin,
        },
        rules: {
            // Relaxed rules for config files
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-non-null-assertion': 'warn',

            // General rules
            'no-console': 'off', // Allow console in config files
            'no-debugger': 'warn',
            'no-unused-vars': 'off',
            'prefer-const': 'warn',
            'no-var': 'error',
            'object-shorthand': 'warn',
            'eqeqeq': ['warn', 'always'],
        },
    },
    prettier,
]