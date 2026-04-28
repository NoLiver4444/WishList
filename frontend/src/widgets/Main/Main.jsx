/**
 * @file Универсальный компонент-контейнер для страниц списков.
 * @module widgets/Main
 */

import { memo, useMemo, useState } from 'react';
import SortCardsForm from '@/features/cards/sort-cards/SortCardsForm';
import CardList from '@/entities/ui/CardList';
import { sortItems } from '@/shared/lib/sortItems';
import styles from './Main.module.css';

/**
 * Компонент Main.
 * Автоматически сортирует данные и отображает либо CardList, либо переданный children.
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {string} props.title - Заголовок страницы.
 * @param {'wishes'|'wishlists'} [props.type='wishes'] - Тип отображаемого контента для стилизации.
 * @param {Array<{label: string, value: string}>} [props.sortOptions=[]] - Опции для выпадающего списка сортировки.
 * @param {Array} [props.data=[]] - Массив данных для отображения.
 * @param {Function} [props.onAddClick] - Коллбэк для кнопки добавления новой карточки.
 * @param {React.ReactNode} [props.children] - Возможность переопределить стандартный список карточек.
 */

const Main = ({
  title,
  type = 'wishes',
  sortOptions = [],
  onAddClick,
  onEdit,
  onDelete,
  data = [],
  children,
}) => {
  const [currentSort, setCurrentSort] = useState(sortOptions[0]?.value);

  const sortedData = useMemo(
    () => sortItems(data, currentSort),
    [data, currentSort]
  );

  return (
    <div className={`${styles.main} ${styles[type]}`}>
      <h1 className={styles.title}>{title}</h1>

      {sortOptions.length > 0 && (
        <SortCardsForm
          options={sortOptions}
          activeSort={currentSort}
          onSortChange={setCurrentSort}
        />
      )}

      <div className={`${styles.content} ${styles[type]}`}>
        {children ? (
          children
        ) : (
          <CardList
            type={type}
            items={sortedData}
            onAddClick={onAddClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
};

export default memo(Main);
