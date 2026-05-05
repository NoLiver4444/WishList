/**
 * @file Настройки проверки кода ESLint (Flat Config).
 */

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{js,jsx}'],
		ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
		extends: [
			js.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: 'latest',
				ecmaFeatures: {jsx: true},
				sourceType: 'module',
			},
		},
		rules: {
			'no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z_]'}],
		},
	},
]);
