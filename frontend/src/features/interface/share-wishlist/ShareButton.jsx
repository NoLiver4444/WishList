/**
 * @file Кнопка для копирования ссылки на публичный просмотр вишлиста.
 * @module features/interface/share-wishlist/ShareButton
 */

import { memo } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './ShareButton.module.css';

/**
 * Компонент ShareButton.
 * Извлекает ID вишлиста из URL и копирует сформированную ссылку в буфер обмена.
 */
const ShareButton = () => {
  const location = useLocation();

  const match = location.pathname.match(/\/wishlists\/([^/]+)/);
  const wishlistId = match?.[1];

  if (!wishlistId) return null;

  const shareUrl = `${window.location.origin}/view/${wishlistId}`;

  const handleShare = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Ссылка скопирована!', {
      style: {
        background: '#1e1e1e',
        color: '#ddd',
        borderRadius: '10px',
      },
    });
  };

  return (
    <div className={styles.wrapper}>
      <button onClick={handleShare} className={styles.button}>
        Поделиться
      </button>
    </div>
  );
};

export default memo(ShareButton);
