/**
 * @file Кнопка навигации в шапке приложения.
 * @module shared/ui/Interface/HeaderButton
 */

import { forwardRef, memo } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '@/shared/ui/Interface/Navigation/Navigation.module.css';

/**
 * Компонент HeaderButton.
 * Отрисовывает ссылку навигации с иконкой. Использует NavLink для автоматического
 * определения активного состояния маршрута.
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.item - Объект конфигурации пункта меню (id, path, icon).
 * @param {string} [props.className] - Дополнительные CSS-классы.
 * @param {React.Ref} ref - Реф, передаваемый элементу списка (li) для вычисления координат анимации.
 */
const HeaderButton = forwardRef(({ item, className }, ref) => {
  const Icon = item.icon;
  return (
    <li ref={ref}>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `${styles.item} ${className} ${isActive ? styles.activeItem : ''}`
        }
      >
        <Icon size={26} strokeWidth={2} className={styles.icon} />
      </NavLink>
    </li>
  );
});

export default memo(HeaderButton);
