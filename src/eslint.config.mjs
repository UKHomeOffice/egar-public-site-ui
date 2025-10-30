import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: {
            js,
            prettier: eslintPluginPrettier,
        },
        extends: [
            'js/recommended',
            prettier, // disables conflicting ESLint rules
        ],
        rules: {
            'prettier/prettier': 'error', // run prettier as an ESLint rule
        },
        languageOptions: {
            globals: {
                // ...globals.browser,
                ...globals.node,
            },
        },
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
    },
]);
