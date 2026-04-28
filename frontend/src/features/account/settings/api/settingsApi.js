/**
 * @file API-клиент для управления данными пользователя.
 * @module features/account/settings/api/settingsApi.js
 */

import { apiClient } from '@/shared/api/apiClient.js';

/**
 * Обновляет данные профиля (логин, email, телефон или пароль).
 * @param {Object} body - Объект с обновляемыми полями.
 * @returns {Promise<Object>} Обновленный объект пользователя.
 */
export const updateUserRequest = (body) =>
  apiClient('/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

/**
 * Удаляет текущий аккаунт пользователя.
 * @param {Object} body - Объект, содержащий подтверждающий пароль.
 * @returns {Promise<void>}
 */
export const deleteUserRequest = (body) =>
  apiClient('/v1/users/me', {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
