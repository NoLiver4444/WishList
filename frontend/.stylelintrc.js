/**
 * @file Конфигурация проверки стилей Stylelint.
 */

/** @type {import('stylelint').Config} */
export default {
	extends: [
		'stylelint-config-standard',
		'stylelint-config-clean-order',
	],
	rules: {
		'selector-class-pattern': null,
		'declaration-no-important': true,
		'color-hex-length': 'short',
		'alpha-value-notation': 'number',
	},
};
