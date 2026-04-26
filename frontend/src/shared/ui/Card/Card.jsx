import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ellipsis, Gift, Plus } from 'lucide-react';
import { FriendHeader, WishHeader, WishlistHeader } from './CardHeaders';
import Avatar from '@/shared/ui/Avatar';
import CardMenu from '@/shared/ui/CardMenu';
import styles from './Card.module.css';

const Card = ({ item, type, onAddWish, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const cardWish = type === 'wishes';
  const cardWishlist = type === 'wishlists';
  const cardFriend = type === 'friends';

  const {
    name,
    date,
    price,
    image,
    imageUrl,
    url,
    description,
    counts,
    friendId,
  } = item;

  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const resolvedImage =
    image instanceof File ? URL.createObjectURL(image) : imageUrl || null;

  const handleCardClick = (e) => {
    if (e.target.closest(`.${styles.menuButton}`)) return;
  };

  const handleAction = (action, e) => {
    e?.stopPropagation();
    if (action === 'view') navigate(`/wishlists/${item.id}`);
    if (action === 'edit') onEdit?.(item);
    if (action === 'delete') onDelete?.(item.id);
  };

  return (
    <li
      className={`${styles.card} ${styles[type]} ${item._loading ? styles.loading : ''}}`}
      onClick={handleCardClick}
    >
      <div className={styles.header}>
        {cardWish && <WishHeader name={name} dateOptions={dateOptions} />}
        {cardWishlist && (
          <WishlistHeader
            name={name}
            date={date}
            counts={counts}
            dateOptions={dateOptions}
          />
        )}
        {cardFriend && <FriendHeader name={name} friendId={friendId} />}

        <div className={styles.menuWrapper}>
          <button
            className={styles.menuButton}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <Ellipsis size={20} strokeWidth={2} />
          </button>
          <CardMenu
            type={type}
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onAction={handleAction}
          />
        </div>
      </div>

      <div className={styles.body}>
        {cardWish && (
          <div className={styles.imageWrapper}>
            {resolvedImage ? (
              <img src={resolvedImage} alt={name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>
        )}

        {description && <p className={styles.description}>{description}</p>}

        {cardWish && price !== undefined && (
          <div className={styles.priceRow}>
            <span className={styles.price}>
              {Number(price).toLocaleString('ru-RU')} ₽
            </span>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Перейти
              </a>
            )}
          </div>
        )}

        {cardWishlist && (
          <div className={styles.wishlistBody}>
            {counts === 0 ? (
              <button
                className={styles.addWish}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/wishlists/${item.id}`);
                }}
              >
                <Plus size={40} strokeWidth={2} />
                <span>Добавить желание</span>
              </button>
            ) : (
              <div
                className={styles.previewGrid}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/wishlists/${item.id}`);
                }}
                style={{ cursor: 'pointer' }}
              >
                {(
                  item.previews ?? [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                  ]
                )
                  .slice(0, 9)
                  .map((src, i) => (
                    <div key={i} className={styles.previewCell}>
                      {src ? (
                        <img src={src} alt="" className={styles.previewImg} />
                      ) : (
                        <Gift size={20} className={styles.previewIcon} />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {cardFriend && (
          <div className={styles.friendBody}>
            <Avatar src={item.avatarUrl} alt={name} size={80} />
          </div>
        )}
      </div>
    </li>
  );
};

export default memo(Card);
