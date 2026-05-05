/**
 * @file API для работы с конкретными желаниями.
 * @module entities/api/items
 */

import { client } from '@/shared/api/client.api';

/**
 * Добавить желание в вишлист.
 * @param {string|number} wishlistId - ID вишлиста.
 * @param {Object} body - Данные желания.
 * @returns {Promise}
 */
export const addItem = (wishlistId, body) =>
	client(`/api/wishlists/${wishlistId}/items`, {
		method: 'POST',
		body: JSON.stringify(body),
	});

/**
 * Удалить желание.
 * @param {string|number} itemId - ID желания.
 * @returns {Promise}
 */
export const removeItem = (itemId) =>
	client(`/api/items/${itemId}`, {method: 'DELETE'});

/**
 * Резервирование предмета.
 * @param {string|number} itemId - ID элемента.
 * @param {boolean} isReserved - Текущий статус (зарезервирован или нет).
 */
export const reserveItem = (itemId, isReserved) =>
	client(`/api/items/${itemId}/reserve`, {
		method: 'POST',
		body: JSON.stringify({is_reserved: isReserved}),
	});