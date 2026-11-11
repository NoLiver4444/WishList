/**
 * @file Переменные окружения фронтенда.
 * @module shared/config/env
 */

/**
 * Базовый URL API без завершающего слэша.
 * Пустая строка — запросы идут на относительный путь /api (nginx или dev-прокси Vite).
 * @type {string}
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
