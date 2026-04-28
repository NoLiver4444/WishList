/**
 * @file Утилита для сортировки списков.
 * @module shared/lib/sortItems
 */

/**
 * Сортирует массив элементов по заданному критерию.
 * Поддерживает сортировку по имени, цене, дедлайну, количеству товаров и дате рождения.
 * * @function sortItems
 * @param {Array<Object>} items - Исходный массив элементов.
 * @param {string} sortBy - Ключ сортировки ('name', 'price', 'deadline', 'count_products', 'birthday_date').
 * @returns {Array<Object>} Новый отсортированный массив.
 */
export const sortItems = (items, sortBy) => {
  const sorted = [...items];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);

    case 'price':
      return sorted.sort((a, b) => {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
        return aPrice - bPrice;
      });

    case 'deadline':
      return sorted.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });

    case 'count_products':
      return sorted.sort((a, b) => (b.counts ?? 0) - (a.counts ?? 0));

    case 'birthday_date':
      return sorted.sort((a, b) => {
        if (!a.birthday && !b.birthday) return 0;
        if (!a.birthday) return 1;
        if (!b.birthday) return -1;
        return new Date(a.birthday) - new Date(b.birthday);
      });

    case 'date_added':
    default:
      return sorted;
  }
};
