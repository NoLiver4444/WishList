/**
 * @file Компонент элемента списка внутри вишлиста.
 * @module shared/ui/Cards/WishlistItem
 */

import { memo } from 'react';
import { Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import styles from './WishlistItem.module.css';

/**
 * Компонент WishlistItem.
 * Отображает информацию о конкретном желании в списке: фото, название, цену,
 * комментарий и ссылку на магазин. Поддерживает функционал резервирования.
 * Вид карточки зависит от режима доступа вишлиста.
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.item - Объект данных элемента списка.
 * @param {Object} props.item.product - Данные о самом товаре (title, image_url, price, url).
 * @param {string} [props.item.comment] - Пользовательский комментарий к подарку.
 * @param {boolean} props.item.is_reserved - Флаг, забронирован ли товар кем-либо.
 * @param {boolean} [props.item.reserved_by_me] - Забронировал ли товар текущий пользователь.
 * @param {string|number} props.item.id - ID связи товара и списка.
 * @param {Function} props.onRemove - Обработчик удаления товара из списка.
 * @param {function(string|number, boolean): void} props.onReserve - Бронирование/снятие брони (передаётся текущее состояние).
 * @param {boolean} props.isOwner - Текущий пользователь — владелец вишлиста.
 * @param {boolean} props.canReserve - Пользователь авторизован (гость бронировать не может).
 * * @returns {React.ReactElement} Элемент списка (li).
 */
const WishlistItem = ({ item, onRemove, onReserve, isOwner, canReserve }) => {
  const { product, comment, is_reserved, reserved_by_me } = item;

  // Владелец не бронирует свои желания, но может снять чужую бронь;
  // остальные бронируют свободное и снимают только свою бронь.
  const canChangeReserve =
    canReserve && (is_reserved ? isOwner || reserved_by_me : !isOwner);

  const reserveTitle = (() => {
    if (!canReserve) return 'Войдите, чтобы забронировать';
    if (is_reserved) {
      if (reserved_by_me) return 'Снять мою бронь';
      return isOwner ? 'Снять бронь' : 'Зарезервировано кем-то другим';
    }
    return isOwner ? 'Свои желания бронировать нельзя' : 'Зарезервировать';
  })();

  return (
    <li className={styles.item}>
      {product?.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          className={styles.itemImage}
        />
      )}

      <div className={styles.itemBody}>
        <h3 className={styles.itemTitle}>{product?.title}</h3>

        {comment && <p className={styles.itemComment}>{comment}</p>}

        {product?.price && (
          <span className={styles.itemPrice}>
            {Number(product.price).toLocaleString('ru-RU')} ₽
          </span>
        )}

        {product?.url && (
          <a
            href={product?.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.itemLink}
          >
            Перейти →
          </a>
        )}
      </div>

      <div className={styles.itemActions}>
        <button
          className={`${styles.reserveButton} ${is_reserved ? styles.reserved : ''}`}
          onClick={() => canChangeReserve && onReserve(item.id, is_reserved)}
          disabled={!canChangeReserve}
          style={{
            opacity: canChangeReserve ? 1 : 0.5,
            cursor: canChangeReserve ? 'pointer' : 'not-allowed',
          }}
          title={reserveTitle}
        >
          {is_reserved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>

        {isOwner && (
          <button
            className={styles.removeButton}
            onClick={() => onRemove(item.id)}
            title="Удалить"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </li>
  );
};

export default memo(WishlistItem);
