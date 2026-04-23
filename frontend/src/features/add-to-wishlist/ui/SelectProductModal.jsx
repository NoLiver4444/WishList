import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, X } from 'lucide-react';
import { fetchMyProducts } from '@/entities/wishlist/api/wishlistApi';
import styles from './SelectProductModal.module.css';

const SelectProductModal = ({ isOpen, onClose, onSelect }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchMyProducts()
      .then((data) =>
        setProducts(Array.isArray(data) ? data : (data.products ?? []))
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Выбрать желание</h2>
            <button className={styles.close} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.search}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Поиск..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <ul className={styles.list}>
            {loading && <li className={styles.state}>Загрузка...</li>}

            {!loading && filtered.length === 0 && (
              <li className={styles.state}>
                {products.length === 0
                  ? 'У вас пока нет желаний — добавьте их в разделе «Мои желания»'
                  : 'Ничего не найдено'}
              </li>
            )}

            {!loading &&
              filtered.map((product) => (
                <li key={product.id} className={styles.item}>
                  <div className={styles.itemPreview}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className={styles.itemImage}
                      />
                    ) : (
                      <div className={styles.itemPlaceholder} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{product.title}</span>
                    {product.price && (
                      <span className={styles.itemPrice}>
                        {Number(product.price).toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                  <button
                    className={styles.addBtn}
                    onClick={() => {
                      onSelect(product.id);
                      onClose();
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </li>
              ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SelectProductModal;
