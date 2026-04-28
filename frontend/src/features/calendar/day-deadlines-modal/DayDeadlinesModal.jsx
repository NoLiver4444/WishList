/**
 * @file Модальное окно списка дедлайнов на конкретный день.
 * @module features/calendar/day-deadlines-modal/DayDeadlinesModal
 */

import { memo, useRef } from 'react';
import { useEscClose } from '@/shared/hooks/useEscClose.jsx';
import { useClickOutside } from '@/shared/hooks/useClickOutside.jsx';
import styles from './DayDeadlinesModal.module.css';

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/**
 * Модалка, отображающая список вишлистов, у которых дедлайн совпадает с выбранной датой.
 * @param {Object} props
 * @param {Date} props.date - Выбранная дата.
 * @param {Array} props.wishlists - Массив объектов вишлистов для отображения.
 * @param {Function} props.onClose - Функция закрытия модального окна.
 */
const DayDeadlinesModal = ({ date, wishlists, onClose }) => {
  const modalRef = useRef(null);

  useEscClose(onClose);
  useClickOutside([modalRef], onClose);

  if (!date) return null;

  const formattedDate = `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h3 className={styles.title}>Дедлайны · {formattedDate}</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {wishlists.length === 0 ? (
            <p className={styles.empty}>
              Нет вишлистов с дедлайном в этот день
            </p>
          ) : (
            <ul className={styles.list}>
              {wishlists.map((w) => (
                <li key={w.id} className={styles.item}>
                  <div className={styles.itemDot} />
                  <div className={styles.itemContent}>
                    <span className={styles.itemTitle}>{w.title}</span>
                    {w.description && (
                      <span className={styles.itemDesc}>{w.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(DayDeadlinesModal);
