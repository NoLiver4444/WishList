/**
 * @file Компоненты заголовков для различных типов карточек.
 * @module shared/ui/Cards/Card/config
 */

import styles from '../Card.module.css';

/**
 * Заголовок для карточки желания.
 * @component
 * @param {Object} props
 * @param {string} props.name - Название желания.
 * @param {string} [props.date] - Дата дедлайна.
 * @param {Object} props.dateOptions - Настройки форматирования даты.
 */
export const WishHeader = ({ name, date, dateOptions }) => (
  <div className={styles.information}>
    <h5 className={styles.title}>{name}</h5>
    {date && (
      <span className={styles.date}>
        До {new Date(date).toLocaleDateString('ru-RU', dateOptions)}
      </span>
    )}
  </div>
);

/**
 * Заголовок для карточки списка желаний (вишлиста).
 * @component
 * @param {Object} props
 * @param {string} props.name - Название списка.
 * @param {string} [props.date] - Дата события.
 * @param {number} [props.counts] - Количество товаров в списке.
 * @param {Object} props.dateOptions - Настройки форматирования даты.
 */
export const WishlistHeader = ({ name, date, counts, dateOptions }) => (
  <div className={styles.information}>
    <h5 className={styles.title}>{name}</h5>
    <div className={styles.meta}>
      {counts !== undefined && (
        <span className={styles.counts}>Желаний: {counts}</span>
      )}
      {date && (
        <span className={styles.date}>
          До {new Date(date).toLocaleDateString('ru-RU', dateOptions)}
        </span>
      )}
    </div>
  </div>
);

/**
 * Заголовок для карточки друга.
 * @component
 * @param {Object} props
 * @param {string} props.login - Имя/логин друга.
 */
export const FriendHeader = ({ login }) => (
  <div className={styles.information}>
    <h5 className={styles.title}>{login}</h5>
  </div>
);
