/**
 * @file Универсальный клиент для работы с API.
 * @module shared/api/client
 */

import { useSessionStore } from '@/entities/session/model/sessionStore';
import { API_URL } from '@/shared/config/env';

/**
 * Ошибка HTTP-запроса к API.
 * @typedef {Object} ApiError
 * @property {number} status - HTTP-статус (0 — сетевая ошибка).
 * @property {string} message - Сообщение для пользователя.
 * @property {string} [code] - Машиночитаемый код ошибки от бэкенда.
 */

/**
 * Безопасно разбирает тело ответа: JSON, если это JSON, иначе текст или null.
 * @param {Response} r
 * @returns {Promise<any>}
 */
const parseBody = async (r) => {
  const text = await r.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

/**
 * Разлогинивает текущий аккаунт и ведёт на страницу входа.
 * Вызывается при 401 на запросе с токеном (токен истёк или недействителен).
 * @param {string} token - Токен, с которым был сделан запрос.
 */
const handleUnauthorized = (token) => {
  const store = useSessionStore.getState();
  if (store.accounts[store.activeIndex]?.token !== token) return;
  store.logout();
  if (window.location.pathname !== '/auth') {
    window.location.assign('/auth');
  }
};

/**
 * Выполняет сетевой запрос к API с поддержкой авторизации.
 * Добавляет заголовок Authorization (если есть активный токен) и Content-Type: application/json.
 * @async
 * @function client
 * @param {string} url - Путь эндпоинта, начиная с /api (базовый URL берётся из VITE_API_URL).
 * @param {RequestInit & {auth?: boolean}} [options={}] - Опции fetch; auth: false — не отправлять токен.
 * @throws {ApiError} Если ответ не ok или сеть недоступна.
 * @returns {Promise<any>} Десериализованный JSON или null для пустого ответа.
 */
export const client = async (url, options = {}) => {
  const { auth = true, headers, ...rest } = options;
  const store = useSessionStore.getState();
  const token = auth ? store.accounts[store.activeIndex]?.token : undefined;

  let r;
  try {
    r = await fetch(`${API_URL}${url}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw { status: 0, message: 'Сервер недоступен' };
  }

  const data = await parseBody(r);

  if (!r.ok) {
    if (r.status === 401 && token) handleUnauthorized(token);
    throw {
      status: r.status,
      message: data?.message || `Ошибка ${r.status}`,
      code: data?.code,
    };
  }

  return data;
};
