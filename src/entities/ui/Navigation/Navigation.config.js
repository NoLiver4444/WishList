import { Heart, Home, Users, Calendar } from 'lucide-react';
import styles from './Navigation.module.css';

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
    icon: Home,
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
