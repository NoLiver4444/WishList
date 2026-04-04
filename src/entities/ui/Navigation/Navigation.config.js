import { Heart, Home, Users, Calendar } from 'lucide-react';
import styles from './Navigation.module.css';

export const NAV_ITEMS = [
  { id: 'favorite', label: 'Желания', icon: Heart, style: styles.favorite },
  { id: 'wishlists', label: 'Вишлисты', icon: Home, style: styles.wishlists },
  { id: 'friends', label: 'Друзья', icon: Users, style: styles.friends },
  { id: 'calendar', label: 'Календарь', icon: Calendar, style: styles.calendar, },
];
