/**
 * Возвращает вишлисты, дедлайн которых совпадает с переданной датой.
 * Совместимо с форматом API: поле deadline приходит как ISO строка.
 * @param {Array} wishlists
 * @param {Date} date
 * @returns {Array}
 */
export const getDeadlinesByDate = (wishlists, date) => {
  return wishlists.filter((w) => {
    if (!w.deadline) return false;
    const d = new Date(w.deadline);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  });
};
