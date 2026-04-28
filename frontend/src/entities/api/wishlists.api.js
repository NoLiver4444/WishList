/**
 * @file API для работы с вишлистами.
 * @module entities/api/wishlists
 */

import { apiClient } from '@/shared/api/apiClient.js';

/**
 * @typedef {Object} Wishlist
 * @property {number|string} id - ID вишлиста.
 * @property {string} name - Название.
 * @property {string} [description] - Описание.
 * @property {string} [deadline] - ISO дата дедлайна.
 * @property {number} [counts] - Количество элементов.
 */

/**
 * Получить список всех вишлистов.
 * @returns {Promise}
 */
export const fetchWishlists = () => apiClient('/v1/wishlists');

/**
 * Получить элементы вишлиста по ID.
 * @param {string|number} id - ID вишлиста.
 * @returns {Promise}
 */
export const fetchWishlistItems = (id) =>
  apiClient(`/v1/wishlists/${id}/items`);

/**
 * Создать вишлист.
 * @param {Object} body - Данные вишлиста (name, deadline, и др.).
 * @returns {Promise}
 */
export const createWishlist = (body) =>
  apiClient('/v1/wishlists', {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      deadline: body.deadline
        ? new Date(body.deadline).toISOString()
        : undefined,
    }),
  });

/**
 * Получить данные одного вишлиста.
 * @param {string|number} id - ID вишлиста.
 * @returns {Promise}
 */
export const fetchWishlist = (id) => apiClient(`/v1/wishlists/${id}`);

/**
 * Удалить вишлист.
 * @param {string|number} id - ID вишлиста.
 * @returns {Promise}
 */
export const deleteWishlist = (id) =>
  apiClient(`/v1/wishlists/${id}`, { method: 'DELETE' });

/**
 * Обновить данные вишлиста.
 * @param {string|number} id - ID вишлиста.
 * @param {Object} body - Новые данные.
 * @returns {Promise}
 */
export const updateWishlist = (id, body) =>
  apiClient(`/v1/wishlists/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...body,
      deadline: body.deadline
        ? new Date(body.deadline).toISOString()
        : undefined,
    }),
  });
