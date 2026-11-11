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
  // В мок-режиме (npm run devm) картинка хранится как data URL, Cloudinary не нужен.
  if (import.meta.env.MODE === 'mock') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
      reader.readAsDataURL(file);
    });
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error(
      'Загрузка файлов не настроена (VITE_CLOUDINARY_*). Укажите ссылку на изображение.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) throw new Error('Ошибка загрузки изображения');

  const data = await res.json();
  return data.secure_url;
};
