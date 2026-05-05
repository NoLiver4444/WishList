/**
 * @file Конфиг для меню карточки.
 * @module shared/ui/Cards/CardMenu/config
 */

import { Eye, Pencil, Trash2 } from 'lucide-react';

/**
 * @typedef {Object} ActionItem
 * @property {string} id - Уникальный идентификатор действия
 * @property {string} label - Текст для отображения
 * @property {React.ComponentType} icon - Иконка из lucide-react
 * @property {boolean} [danger] - Флаг опасного действия (подсветка красным)
 */

/**
 * Объект доступных действий для разных типов контента.
 * @readonly
 * @type {Object<string, ActionItem[]>}
 */
export const ACTIONS = {
  wishlists: [
    { id: 'view', label: 'Просмотреть', icon: Eye },
    { id: 'edit', label: 'Изменить', icon: Pencil },
    { id: 'delete', label: 'Удалить', icon: Trash2, danger: true },
  ],
  wishes: [
    { id: 'edit', label: 'Изменить', icon: Pencil },
    { id: 'delete', label: 'Удалить', icon: Trash2, danger: true },
  ],
  friends: [{ id: 'delete', label: 'Удалить', icon: Trash2, danger: true }],
};
