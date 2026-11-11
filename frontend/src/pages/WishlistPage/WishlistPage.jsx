/**
 * @file Страница детального просмотра вишлиста.
 * @module pages/WishlistPage
 */

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteWishlist,
  fetchPublicWishlist,
  fetchPublicWishlistItems,
  fetchWishlist,
  fetchWishlistItems,
} from '@/entities/api/wishlists.api';
import {
  addItem,
  removeItem,
  reserveItem,
  unreserveItem,
} from '@/entities/api/items.api';
import SelectProductModal from '@/features/cards/add-to-wishlist/SelectProductModal';
import WishlistItem from '@/shared/ui/Card/WishlistItem';
import { useSearch } from '@/shared/hooks/useSearch';
import styles from './WishlistPage.module.css';
import { useSessionStore } from '@/entities/session';

/**
 * Компонент WishlistPage.
 * Режимы: 'owner' (маршрут /wishlists/:id, только для авторизованных) и 'public' (/view/:id).
 * В public-режиме гость без входа получает данные через публичный API (только privacy = public);
 * авторизованный пользователь — через защищённый API, где учитывается дружба и доступно бронирование.
 * Права владельца определяются по user_id вишлиста, а не по режиму.
 * @component
 * @param {Object} props - Свойства компонента.
 * @param {'owner'|'public'} [props.mode='owner'] - Режим доступа к странице.
 */
const WishlistPage = ({ mode = 'owner' }) => {
  const token = useSessionStore((s) => s.accounts[s.activeIndex]?.token);
  const currentUser = useSessionStore((s) => s.accounts[s.activeIndex]?.user);
  const isGuest = mode === 'public' && !token;
  const { id } = useParams();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const location = useLocation();

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const loadItems = useCallback(
    () => (isGuest ? fetchPublicWishlistItems(id) : fetchWishlistItems(id)),
    [id, isGuest]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    const loadWishlist = isGuest ? fetchPublicWishlist : fetchWishlist;
    Promise.all([loadWishlist(id), loadItems()])
      .then(([wl, its]) => {
        setWishlist(wl);
        setItems(Array.isArray(its) ? its : []);
      })
      .catch((err) => {
        if (err.status === 404) setError('Вишлист не найден');
        else if (err.status === 403) setError('Нет доступа к этому вишлисту');
        else setError('Ошибка загрузки');
      })
      .finally(() => setLoading(false));
  }, [id, isGuest, loadItems]);

  const isOwner = !!currentUser && wishlist?.user_id === currentUser.id;

  const processedItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = items.filter((item) => {
      const productTitle = item.product?.title || '';
      return productTitle.toLowerCase().includes(query);
    });

    return [...filtered].sort((a, b) => {
      const aRes = !!a.is_reserved;
      const bRes = !!b.is_reserved;

      if (aRes === bRes) return 0;

      return aRes ? -1 : 1;
    });
  }, [items, searchQuery]);

  const handleAddItem = async (productId) => {
    if (items.some((i) => i.product?.id === productId)) {
      toast('Это желание уже в вишлисте');
      return;
    }
    try {
      const created = await addItem(id, { product_id: productId });
      setItems((prev) => [...prev, created]);
    } catch (err) {
      toast.error(err.message || 'Ошибка добавления');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      toast.error(err.message || 'Ошибка удаления');
    }
  };

  /**
   * Бронирует или снимает бронь явным действием (без инверсии на сервере),
   * поэтому состояние не рассинхронизируется между вкладками.
   * @param {string} itemId
   * @param {boolean} isReserved - Текущее состояние в UI.
   */
  const handleReserve = async (itemId, isReserved) => {
    try {
      if (isReserved) await unreserveItem(itemId);
      else await reserveItem(itemId);

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, is_reserved: !isReserved, reserved_by_me: !isReserved }
            : i
        )
      );
    } catch (err) {
      toast.error(err.message || 'Ошибка бронирования');
      // Состояние на сервере могло измениться (например, бронь из другой вкладки).
      loadItems()
        .then((its) => setItems(Array.isArray(its) ? its : []))
        .catch(() => {});
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить вишлист?')) return;
    try {
      await deleteWishlist(id);
      navigate('/wishlists');
    } catch (err) {
      toast.error(err.message || 'Ошибка удаления вишлиста');
    }
  };

  if (loading) return <div className={styles.state}>Загрузка...</div>;
  if (error) return <div className={styles.state}>{error}</div>;
  if (!wishlist) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {isOwner && (
          <button
            className={styles.back}
            onClick={() => navigate('/wishlists')}
          >
            Назад
          </button>
        )}

        <div className={styles.info}>
          <h1 className={styles.title}>{wishlist.name}</h1>
          {wishlist.deadline && (
            <span className={styles.deadline}>
              До{' '}
              {new Date(wishlist.deadline).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {isOwner && (
          <button className={styles.deleteButton} onClick={handleDelete}>
            Удалить вишлист
          </button>
        )}
      </div>

      <ul className={styles.grid}>
        {processedItems.map((item) => (
          <WishlistItem
            key={item.id}
            item={item}
            onRemove={handleRemoveItem}
            onReserve={handleReserve}
            isOwner={isOwner}
            canReserve={!!token}
          />
        ))}

        {isOwner && (
          <li className={styles.addCard} onClick={() => setIsSelectOpen(true)}>
            <Plus size={32} strokeWidth={1.5} />
            <span>Добавить желание</span>
          </li>
        )}
      </ul>

      {isOwner && (
        <SelectProductModal
          isOpen={isSelectOpen}
          onClose={() => setIsSelectOpen(false)}
          onSelect={handleAddItem}
          existingProductIds={items.map((i) => i.product?.id).filter(Boolean)}
        />
      )}
    </div>
  );
};

export default memo(WishlistPage);
