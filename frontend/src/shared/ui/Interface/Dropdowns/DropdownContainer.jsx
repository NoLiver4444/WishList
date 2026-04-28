/**
 * @file Универсальный контейнер для выпадающих меню с анимацией.
 * @module shared/ui/Interface/Dropdowns/DropdownContainer
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import styles from '@/shared/ui/Interface/Menu/Menu.module.css';

/**
 * Компонент DropdownContainer.
 * Оборачивает содержимое в motion.div с настроенным эффектом появления (spring animation).
 * * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое выпадающего окна.
 */
export const DropdownContainer = ({ children }) => (
  <motion.div
    className={styles.dropdown}
    initial={{ scale: 0.9, opacity: 0, y: -15 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.9, opacity: 0, y: -15 }}
    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
  >
    {children}
  </motion.div>
);

export default memo(DropdownContainer);
