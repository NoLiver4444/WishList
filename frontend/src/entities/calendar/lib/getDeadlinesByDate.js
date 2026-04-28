/**
 * Фильтрует вишлисты, у которых дедлайн совпадает с переданной датой.
 * * @function getDeadlinesByDate
 * @param {Array<Object>} wishlists - Массив объектов вишлистов.
 * @param {Date} date - Объект даты для проверки.
 * @returns {Array<Object>} Список вишлистов, дедлайн которых приходится на этот день.
 */
export const getDeadlinesByDate = (wishlists, date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const key = `${y}-${m}-${d}`;

  return wishlists.filter((w) => w.deadline === key);
};
