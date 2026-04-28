/**
 * @file Универсальный клиент для работы с API.
 * @module shared/api/apiClient
 */

import { useSessionStore } from '@/entities/session';

/**
 * Выполняет сетевой запрос к API с поддержкой авторизации.
 * Автоматически добавляет заголовок Authorization, если в хранилище есть активный токен,
 * и устанавливает Content-Type: application/json.
 * * @async
 * @function apiClient
 * @param {string} url - Относительный путь эндпоинта (базовый URL берется из VITE_API_URL).
 * @param {RequestInit} [options={}] - Дополнительные опции запроса (method, body, headers и т.д.).
 * @throws {Object} Выбрасывает объект с полем status и данными ответа, если r.ok === false.
 * @returns {Promise<Object|null>} Возвращает десериализованный JSON или null для статуса 204.
 */
export const apiClient = (url, options = {}) => {
  const store = useSessionStore.getState();
  const token = store.accounts[store.activeIndex]?.token;

  return fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(async (r) => {
    if (r.status === 204) return null;

    const data = await r.json();
    if (!r.ok) throw { status: r.status, ...data };
    return data;
  });
};
