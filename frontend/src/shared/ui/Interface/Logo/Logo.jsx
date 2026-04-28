/**
 * @file Компонент логотипа.
 * @module shared/ui/Interface/Logo
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import logoIconURL from '@/shared/assets/logo.svg';
import styles from './Logo.module.css';

/**
 * Компонент Logo.
 * Отрисовывает иконку приложения, обернутую в ссылку на главную страницу.
 * * @component
 * @returns {React.ReactElement} Ссылка с изображением логотипа.
 */
const Logo = () => {
  return (
    <Link to="/" className={`${styles.logo}`}>
      <img
        src={logoIconURL}
        alt="CardList wish-piece"
        className={styles.icon}
      />
    </Link>
  );
};

export default memo(Logo);
