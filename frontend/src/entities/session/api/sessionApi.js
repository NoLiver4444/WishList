/**
 * @file API методы для аутентификации и регистрации.
 * @module entities/session/api/sessionApi
 */

import { client } from '@/shared/api/client.api';

/**
 * @typedef {Object} AuthResponse
 * @property {string} token - Токен доступа.
 * @property {Object} user - Объект пользователя.
 */

/**
 * Выполняет запрос на вход в систему.
 * @param {Object} body - Данные для входа.
 * @param {string} body.login_or_email - Логин или email.
 * @param {string} body.password - Пароль.
 * @returns {Promise<AuthResponse>} Данные сессии.
 * @throws {import('@/shared/api/client.api').ApiError}
 */
export const loginRequest = (body) =>
  client('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });

/**
 * Выполняет запрос на регистрацию нового пользователя.
 * @param {Object} body - Данные для регистрации (login, email, password).
 * @returns {Promise<AuthResponse>} Данные новой сессии.
 * @throws {import('@/shared/api/client.api').ApiError}
 */
export const registerRequest = (body) =>
  client('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(body),
  });
