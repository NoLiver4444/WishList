/**
 * @file Страница детального просмотра вишлиста.
 * @module pages/WishlistPage
 */

/**
 * Компонент WishlistPage.
 * Поддерживает два режима: 'owner' (владелец) и 'public' (гость/друг).
 * В режиме владельца доступно удаление списка и добавление новых желаний.
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {'owner'|'public'} [props.mode='owner'] - Режим доступа к странице.
 */
import { memo, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  deleteWishlist,
  fetchWishlist,
  fetchWishlistItems,
} from '@/entities/api/wishlists.api.js';
import { addItem, removeItem, reserveItem } from '@/entities/api/items.api.js';
import SelectProductModal from '@/features/cards/add-to-wishlist/SelectProductModal.jsx';
import WishlistItem from '@/shared/ui/Cards/WishlistItem/index.js';
import { useSearch } from '@/shared/hooks/useSearch.js';
import styles from './WishlistPage.module.css';

const WishlistPage = ({ mode = 'owner' }) => {
  const isOwner = mode === 'owner';
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

  useEffect(() => {
    Promise.all([fetchWishlist(id), fetchWishlistItems(id)])
      .then(([wl, its]) => {
        const list = Array.isArray(its) ? its : (its.items ?? []);
        const unique = list.filter(
          (item, index, self) =>
            index === self.findIndex((i) => i.product?.id === item.product?.id)
        );
        setWishlist(wl);
        setItems(unique);
      })
      .catch((err) => {
        setError(err.status === 404 ? 'Вишлист не найден' : 'Ошибка загрузки');
      })
      .finally(() => setLoading(false));
  }, [id]);

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
    const already = items.some((i) => i.product?.id === productId);
    if (already) {
      console.warn('Это желание уже в вишлисте');
      return;
    }
    try {
      const created = await addItem(id, { product_id: productId });
      setItems((prev) => [...prev, created]);
    } catch (err) {
      console.error('Ошибка добавления:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleReserve = async (itemId, isReserved) => {
    try {
      await reserveItem(itemId, isReserved ? 'unreserve' : 'reserve');
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, is_reserved: !isReserved } : i
        )
      );
    } catch (err) {
      console.error('Ошибка резервирования:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить вишлист?')) return;
    try {
      await deleteWishlist(id);
      navigate('/wishlists');
    } catch (err) {
      console.error('Ошибка удаления вишлиста:', err);
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
