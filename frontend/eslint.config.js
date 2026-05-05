/**
 * @file Настройки проверки кода ESLint (Flat Config).
 */

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
	globalIgnores(['dist', 'coverage', 'node_modules']),
	{
		files: ['**/*.{js,jsx}'],
		plugins: {
			react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		languageOptions: {
			ecmaVersion: 'latest',
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {jsx: true},
				sourceType: 'module',
			},
		},
		rules: {
			...js.configs.recommended.rules,
			...react.configs.recommended.rules,
			...react.configs['jsx-runtime'].rules,
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
			'no-unused-vars': ['warn', {varsIgnorePattern: '^[A-Z_]'}],
			'react/prop-types': 'off',
			...prettierConfig.rules,
		},
		settings: {
			react: {version: 'detect'},
		},
	},
]);
