/**
 * @file Загрузка изображений в Cloudinary.
 * @module shared/api/uploadImage
 */

/**
 * Загружает файл изображения во внешнее хранилище Cloudinary.
 * Использует пресет и имя облака из переменных окружения Vite.
 * * @async
 * @function uploadImage
 * @param {File} file - Объект файла для загрузки.
 * @returns {Promise<string>} URL загруженного изображения (secure_url).
 * @throws {Error} Ошибка при неудачной загрузке.
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) throw new Error('Ошибка загрузки изображения');

  const data = await res.json();
  return data.secure_url;
};
