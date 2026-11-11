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
 * Собирает тело запроса товара из данных формы.
 * Загружает новый файл картинки в Cloudinary, если он выбран.
 * Пустые необязательные поля отправляются как null (при PUT это очищает их).
 * @param {Object} body - Данные формы (name, url, image, imageUrl, description, price).
 * @returns {Promise<Object>}
 */
const toProductPayload = async (body) => {
  let imageUrl =
    typeof body.imageUrl === 'string' && body.imageUrl ? body.imageUrl : null;

  if (body.image instanceof File) {
    imageUrl = await uploadImage(body.image);
  }

  const price =
    body.price === '' || body.price === null || body.price === undefined
      ? null
      : Number(body.price);

  return {
    title: body.name,
    url: body.url || null,
    image_url: imageUrl,
    description: body.description || null,
    price: Number.isFinite(price) ? price : null,
  };
};

/**
 * Создать товар (с загрузкой картинки).
 * @param {Object} body - Данные формы (name, image, price и др.).
 * @returns {Promise}
 */
export const createProduct = async (body) =>
  client('/api/products', {
    method: 'POST',
    body: JSON.stringify(await toProductPayload(body)),
  });

/**
 * Удалить товар.
 * @param {string} id - ID товара.
 * @returns {Promise}
 */
export const deleteProduct = (id) =>
  client(`/api/products/${id}`, { method: 'DELETE' });

/**
 * Обновить товар (полная замена полей, PUT; новая картинка загружается так же, как при создании).
 * @param {string} id - ID товара.
 * @param {Object} body - Данные формы.
 * @returns {Promise}
 */
export const updateProduct = async (id, body) =>
  client(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(await toProductPayload(body)),
  });
