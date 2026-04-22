import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useEscClose } from '@/shared/hooks/useEscClose';
import styles from './CardMenu.module.css';

const ACTIONS = {
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
              onClick={() => {
                onAction(id);
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

export default CardMenu;
