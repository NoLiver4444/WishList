/**
 * @file API для управления каталогом желаний.
 * @module entites/api/products
 */

import { apiClient } from '@/shared/api/apiClient.js';
import { uploadImage } from '@/shared/lib/uploadImage.js';

/**
 * Получить мои товары.
 * @returns {Promise}
 */
export const fetchMyProducts = () => apiClient('/v1/products/me');

/**
 * Создать товар (с загрузкой картинки).
 * @param {Object} body - Объект с данными (name, image, price и др.).
 * @returns {Promise}
 */
export const createProduct = async (body) => {
  let imageUrl =
    typeof body.imageUrl === 'string' && body.imageUrl
      ? body.imageUrl
      : undefined;

  if (body.image instanceof File) {
    imageUrl = await uploadImage(body.image);
  }

  return apiClient('/v1/products', {
    method: 'POST',
    body: JSON.stringify({
      title: body.name,
      url: body.url || undefined,
      image_url: imageUrl,
      description: body.description || undefined,
      price: body.price ? Number(body.price) : undefined,
    }),
  });
};

/**
 * Удалить товар.
 * @param {string|number} id - ID товара.
 * @returns {Promise}
 */
export const deleteProduct = (id) =>
  apiClient(`/v1/products/${id}`, { method: 'DELETE' });

/**
 * Обновить товар.
 * @param {string|number} id - ID товара.
 * @param {Object} body - Обновляемые поля.
 * @returns {Promise}
 */
export const updateProduct = (id, body) =>
  apiClient(`/v1/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title: body.name,
      url: body.url || undefined,
      image_url:
        typeof body.imageUrl === 'string' && body.imageUrl
          ? body.imageUrl
          : undefined,
      description: body.description || undefined,
      price: body.price ? Number(body.price) : undefined,
    }),
  });
