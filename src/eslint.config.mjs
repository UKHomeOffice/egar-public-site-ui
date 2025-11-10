import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  {
    files: ['**/*.{js,cjs,mjs}'],
    plugins: {
      js,
      prettier: eslintPluginPrettier,
    },
    extends: [
      'js/recommended',
      prettierConfig, // disables rules conflicting with Prettier
    ],
    rules: {
      'prettier/prettier': 'error', // Treat Prettier issues as ESLint errors
      'max-len': 'off', // Prettier handles line length
      'unicorn/prefer-module': 'off', // allow require()
      'unicorn/prevent-abbreviations': 'off', // optional
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['public/javascripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser, // window, document, etc.
        $: 'readonly', // jQuery global
        jQuery: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'off',
      'no-console': 'off',
      'no-alert': 'off',
    },
    ignores: ['public/javascripts/all.js'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    rules: {
      'n/no-unpublished-require': 'off', // devDeps in tests
    },
  },
  prettierConfig,
]);
