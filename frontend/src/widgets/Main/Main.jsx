import { memo, useState } from 'react';
import SortCardsForm from '@/features/sort-cards/SortCardsForm';
import CardList from '@/entities/ui/CardList';
import styles from './Main.module.css';

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
            items={data}
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
