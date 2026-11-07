/**
 * @file Конфигурация сборщика Vite.
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { mockApi } from './dev/mockApi.js';

/** @type {import('vite').UserConfigFn} */
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	// Адрес бэкенда для dev-прокси (в docker-сети — http://backend:8080).
	const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';
	// `vite --mode mock` (npm run devm): /api обслуживает мок из dev/mockApi.js, бэкенд не нужен.
	const isMock = mode === 'mock';

	return {
		plugins: [react(), isMock && mockApi()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		server: {
			host: true,
			proxy: isMock ? undefined : {
				// /api/* → {target}/v1/* — так же, как в nginx.conf.
				'/api': {
					target: apiTarget,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, '/v1'),
				},
			},
		},
	};
});
