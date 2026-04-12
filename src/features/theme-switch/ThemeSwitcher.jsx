import {AnimatePresence, motion} from 'framer-motion';
import {ChevronRight, Monitor, Moon, Palette, Sun} from 'lucide-react';
import {useTheme} from '@/shared/hooks/useTheme';
import styles from './ThemeSwitcher.module.css';

const THEMES = [
  {value: 'light', label: 'Светлая', Icon: Sun},
  {value: 'dark', label: 'Тёмная', Icon: Moon},
  {value: 'system', label: 'Системная', Icon: Monitor},
];

const ThemeSubmenu = ({isOpen, onMouseEnter, onMouseLeave}) => {
  const {theme, setTheme} = useTheme();

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
          style={{marginLeft: 'auto'}}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.submenu}
            initial={{opacity: 0, x: -10}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -10}}
            transition={{type: 'spring', damping: 25, stiffness: 400}}
          >
            {THEMES.map(({value, label, Icon}) => (
              <button
                key={value}
                className={`${styles.menuLink} ${theme === value ? styles.activeLink : ''}`}
                onClick={() => setTheme(value)}
              >
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

export default ThemeSubmenu;