import {Calendar, ClipboardList, Heart, Users} from 'lucide-react';

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
