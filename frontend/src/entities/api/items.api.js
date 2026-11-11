/**
 * @file API для работы с конкретными желаниями.
 * @module entities/api/items
 */

import { client } from '@/shared/api/client.api';

/**
 * Добавить желание в вишлист.
 * @param {string} wishlistId - ID вишлиста.
 * @param {Object} body - Данные желания ({ product_id, comment?, order? }).
 * @returns {Promise}
 */
export const addItem = (wishlistId, body) =>
  client(`/api/wishlists/${wishlistId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * Удалить желание.
 * @param {string} itemId - ID желания.
 * @returns {Promise}
 */
export const removeItem = (itemId) =>
  client(`/api/items/${itemId}`, { method: 'DELETE' });

/**
 * Забронировать желание за текущим пользователем.
 * Повторный вызов тем же пользователем безопасен; если бронь чужая — ошибка 409.
 * @param {string} itemId - ID элемента.
 * @returns {Promise}
 */
export const reserveItem = (itemId) =>
  client(`/api/items/${itemId}/reserve`, { method: 'POST' });

/**
 * Снять бронь (свою; владелец вишлиста может снять любую).
 * @param {string} itemId - ID элемента.
 * @returns {Promise}
 */
export const unreserveItem = (itemId) =>
  client(`/api/items/${itemId}/reserve`, { method: 'DELETE' });
