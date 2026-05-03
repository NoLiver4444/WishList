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
 * @param {string|number} props.item.id - ID связи товара и списка.
 * @param {Function} props.onRemove - Обработчик удаления товара из списка.
 * @param {function(string|number, boolean): void} props.onReserve - Функция переключения статуса резерва.
 * * @returns {React.ReactElement} Элемент списка (li).
 */
const WishlistItem = ({ item, onRemove, onReserve, isOwner }) => {
  const { product, comment, is_reserved } = item;

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
          onClick={() => onReserve(item.id, is_reserved)}
          title={is_reserved ? 'Снять резерв' : 'Зарезервировать'}
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
