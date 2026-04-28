/**
 * @file Конфигурация элементов навигации.
 * @module shared/ui/Interface/Navigation/config
 */

import { Calendar, ClipboardList, Heart, Users } from 'lucide-react';

/**
 * @typedef {Object} NavItem
 * @property {string} id - Уникальный идентификатор элемента.
 * @property {string} label - Текстовое название для отображения.
 * @property {string} path - Путь маршрута.
 * @property {React.ComponentType} icon - Компонент иконки из библиотеки lucide-react.
 */

/** * Список пунктов меню для шапки приложения.
 * @type {NavItem[]}
 */
export const NAV_ITEMS = [
  {
    id: 'favorite',
    label: 'Желания',
    path: '/',
    icon: Heart,
  },
  {
    id: 'wishlists',
    label: 'Вишлисты',
    path: '/wishlists',
    icon: ClipboardList,
  },
  {
    id: 'friends',
    label: 'Друзья',
    path: '/friends',
    icon: Users,
  },
  {
    id: 'calendar',
    label: 'Календарь',
    path: '/calendar',
    icon: Calendar,
  },
];
