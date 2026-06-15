import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
    {ignores: ['dist/**', 'ios/**', 'android/**', 'node_modules/**', 'lib/**']},
    {
        files: ['src/**/*.{js,jsx}', 'tests/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
            parserOptions: {ecmaFeatures: {jsx: true}}
        },
        plugins: {react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh},
        settings: {react: {version: 'detect'}},
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
            'no-unused-vars': ['warn', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}]
        }
    },
    {
        files: ['tests/**/*.{js,jsx}', 'playwright.config.js', 'vitest.config.js'],
        languageOptions: {globals: {...globals.browser, ...globals.node}}
    },
    {
        files: ['vite.config.js', 'eslint.config.js', 'tailwind.config.js', 'postcss.config.js'],
        languageOptions: {globals: globals.node}
    }
];
