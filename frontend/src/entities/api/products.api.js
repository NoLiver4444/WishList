/**
 * @file API для управления каталогом желаний.
 * @module entites/api/products
 */

import { client } from '@/shared/api/client.api';
import { uploadImage } from '@/shared/lib/uploadImage';

/**
 * Получить мои товары.
 * @returns {Promise}
 */
export const fetchMyProducts = () => client('/api/products/me');

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

  return client('/api/products', {
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
  client(`/api/products/${id}`, { method: 'DELETE' });

/**
 * Обновить товар.
 * @param {string|number} id - ID товара.
 * @param {Object} body - Обновляемые поля.
 * @returns {Promise}
 */
export const updateProduct = (id, body) =>
  client(`/api/products/${id}`, {
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
