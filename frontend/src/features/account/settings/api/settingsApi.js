/**
 * @file API-клиент для управления данными пользователя.
 * @module features/account/settings/api/settingsApi.js
 */

import { client } from '@/shared/api/client.api.js';

/**
 * Обновляет данные профиля (логин, email, телефон или пароль).
 * @param {Object} body - Объект с обновляемыми полями.
 * @returns {Promise<Object>} Обновленный объект пользователя.
 */
export const updateUserRequest = (body) => {
  const cleaned = Object.fromEntries(
    Object.entries(body).filter(
      ([, v]) => v !== '' && v !== undefined && v !== null
    )
  );

  return client('/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(cleaned),
  });
};

/**
 * Удаляет текущий аккаунт пользователя.
 * @param {Object} body - Объект, содержащий подтверждающий пароль.
 * @returns {Promise<void>}
 */
export const deleteUserRequest = (body) =>
  client('/v1/users/me', {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
