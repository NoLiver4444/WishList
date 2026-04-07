import { Heart, Home, Users, Calendar } from 'lucide-react';
import styles from './Navigation.module.css';

export const NAV_ITEMS = [
  {
    id: 'favorite',
    label: 'Желания',
    path: '/',
    icon: Heart,
    style: styles.favorite,
  },
  {
    id: 'wishlists',
    label: 'Вишлисты',
    path: '/wishlists',
    icon: Home,
    style: styles.wishlists,
  },
  {
    id: 'friends',
    label: 'Друзья',
    path: '/friends',
    icon: Users,
    style: styles.friends,
  },
  {
    id: 'calendar',
    label: 'Календарь',
    path: '/calendar',
    icon: Calendar,
    style: styles.calendar,
  },
];
