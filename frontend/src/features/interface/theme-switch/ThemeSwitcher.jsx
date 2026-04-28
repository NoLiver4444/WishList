/**
 * @file Компонент переключения тем оформления.
 * @module features/interface/theme-switch/ThemeSwitcher
 */

import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Monitor,
  Moon,
  Palette,
  Sun,
  Tractor,
} from 'lucide-react';
import { useTheme } from '@/shared/hooks/useTheme.jsx';
import styles from './ThemeSwitcher.module.css';

/**
 * Доступные темы приложения.
 */
const THEMES = [
  { value: 'dark', label: 'Тёмная', Icon: Moon },
  { value: 'light', label: 'Светлая', Icon: Sun },
  { value: 'contrast', label: 'Контрастная', Icon: Tractor },
  // {value: 'banana', label: 'Банан', Icon: Banana},
  // {value: 'megumin', label: 'Мегумин', Icon: Bomb},
  // {value: 'maomao', label: 'МаоМао', Icon: Cat},
  // {value: 'rin', label: 'Рин Тосака', Icon: Wand},
  // {value: 'artoria', label: 'Артория', Icon: Sword},
  // {value: 'silfiea', label: 'Сильфи', Icon: ScanHeart},
  { value: 'system', label: 'Системная', Icon: Monitor },
];

/**
 * Сабменю выбора темы для выпадающих списков.
 * @param {Object} props
 * @param {boolean} props.isOpen - Состояние видимости меню.
 * @param {Function} props.onMouseEnter - Обработчик наведения.
 * @param {Function} props.onMouseLeave - Обработчик ухода курсора.
 */
const ThemeSubmenu = ({ isOpen, onMouseEnter, onMouseLeave }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={styles.submenuContainer}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button className={styles.menuLink}>
        <Palette size={16} />
        <span>Тема</span>
        <ChevronRight
          size={14}
          className={`${styles.chevronSubmenu} ${isOpen ? styles.chevronSubmenuOpen : ''}`}
          style={{ marginLeft: 'auto' }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.submenu}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          >
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                className={`${styles.menuLink} ${theme === value ? styles.activeLink : ''}`}
                onClick={() => setTheme(value)}
              >
                {theme === value ? (
                  <Check size={16} />
                ) : (
                  <div style={{ width: 16 }} />
                )}
                <Icon size={16} />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(ThemeSubmenu);
