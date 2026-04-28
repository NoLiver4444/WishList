/**
 * @file API для работы с конкретными желаниями.
 * @module entities/api/items
 */

import { apiClient } from '@/shared/api/apiClient.js';

/**
 * Добавить желание в вишлист.
 * @param {string|number} wishlistId - ID вишлиста.
 * @param {Object} body - Данные желания.
 * @returns {Promise}
 */
export const addItem = (wishlistId, body) =>
  apiClient(`/v1/wishlists/${wishlistId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * Удалить желание.
 * @param {string|number} itemId - ID желания.
 * @returns {Promise}
 */
export const removeItem = (itemId) =>
  apiClient(`/v1/items/${itemId}`, { method: 'DELETE' });

/**
 * Зарезервировать или снять резерв с желания.
 * @param {string|number} itemId - ID желания.
 * @param {string} action - 'reserve' или 'unreserve'.
 * @returns {Promise}
 */
export const reserveItem = (itemId, action) =>
  apiClient(`/v1/items/${itemId}/reserve`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
