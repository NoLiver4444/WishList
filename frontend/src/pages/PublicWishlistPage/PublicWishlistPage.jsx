import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchPublicItems,
  fetchPublicWishlist,
} from '@/entities/wishlist/api/wishlistApi.js';

const PublicWishlistPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchPublicWishlist(id), fetchPublicItems(id)])
      .then(([wishlist, items]) => {
        setData(wishlist);
        setItems(Array.isArray(items) ? items : (items.items ?? []));
      })
      .catch((err) => {
        console.error(err);
        setError(err.status === 404 ? 'Вишлист не найден' : 'Ошибка загрузки');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return null;

  return (
    <div className="public-container">
      <h1>{data.name}</h1>
      {data.deadline && (
        <p>До {new Date(data.deadline).toLocaleDateString('ru-RU')}</p>
      )}
      <div className="items-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            {item.product?.image_url && (
              <img src={item.product.image_url} alt={item.product.title} />
            )}
            <h3>{item.product?.title}</h3>
            {item.product?.price && (
              <p>{Number(item.product.price).toLocaleString('ru-RU')} ₽</p>
            )}
          </div>
        ))}
        {items.length === 0 && <p>В этом вишлисте пока нет желаний</p>}
      </div>
    </div>
  );
};

export default memo(PublicWishlistPage);
