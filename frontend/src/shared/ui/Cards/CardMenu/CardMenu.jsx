/**
 * @file Контекстное меню действий для карточки.
 * @module shared/ui/Cards/CardMenu
 */

import { memo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '@/shared/hooks/useClickOutside.jsx';
import { useEscClose } from '@/shared/hooks/useEscClose.jsx';
import { ACTIONS } from './config/Actions.js';
import styles from './CardMenu.module.css';

/**
 * Компонент CardMenu.
 * Выпадающее меню, адаптирующееся под тип карточки (желания, вишлисты, друзья).
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {'wishes'|'wishlists'|'friends'} props.type - Тип контекста для выбора списка действий.
 * @param {boolean} props.isOpen - Флаг видимости меню.
 * @param {Function} props.onClose - Функция закрытия меню (вызывается при клике вне или Esc).
 * @param {function(string, Event): void} props.onAction - Коллбэк, вызываемый при выборе действия.
 */
const CardMenu = ({ type, isOpen, onClose, onAction }) => {
  const ref = useRef(null);
  useClickOutside([ref], onClose);
  useEscClose(onClose);

  const actions = ACTIONS[type] ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          className={styles.menu}
          initial={{ opacity: 0, scale: 0.9, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        >
          {actions.map(({ id, label, icon: Icon, danger }) => (
            <button
              key={id}
              className={`${styles.item} ${danger ? styles.danger : ''}`}
              onClick={(e) => {
                onAction(id, e);
                onClose();
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(CardMenu);
