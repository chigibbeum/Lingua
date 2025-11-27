// eslint.config.ts
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import svelteConfig from './svelte.config.js'

const config = tseslint.config(
  {
    ignores: ['dist/**', 'build/**', '.vite/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],

  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        noWarnOnMultipleProjects: true,
        extraFileExtensions: ['.svelte'],
        tsconfigRootDir: import.meta.dirname,
        svelteConfig,
        svelteFeatures: {
          runes: true,
          experimentalGenerics: true,
        },
      },
    },
  },

  {
    files: ['**/*.{js,ts,svelte}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        noWarnOnMultipleProjects: true,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/core-modules': [
        '$env/dynamic/private',
        '$env/dynamic/public',
        '$env/static/private',
        '$env/static/public',
        '$app/environment',
      ],
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.ts', '.svelte'],
        },
      },
    },
    rules: {
      // --- Core quality / consistency (aligns with § 4.0 Code Review Standards) ---
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      eqeqeq: ['error', 'always'],
      'no-implicit-coercion': 'warn',

      // --- Imports & module structure ---
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: ['type', 'builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'ignore',
        },
      ],

      // --- Expanded multi-line object literals ---
      'object-curly-newline': [
        'error',
        {
          ObjectExpression: 'always',
        },
      ],

      // --- Server/client boundaries ---
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/*.server', '**/*.server.*', 'src/server/**'],
              message: 'Do not import server-only modules into client-side code.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/server/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
  }
)

export default config
