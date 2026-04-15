import { useState } from 'react';
import SortCardsForm from '@/features/sort-cards';
import CardList from '@/entities/ui/CardList';
import styles from './Main.module.css';

const Main = ({
  title,
  variant = 'default',
  type,
  sortOptions = [],
  onAddClick,
  data = [],
  children,
}) => {
  const [currentSort, setCurrentSort] = useState(sortOptions[0]?.value);

  return (
    <div className={`${styles.main} ${styles[variant]}`}>
      <h1 className={styles.title}>{title}</h1>

      {sortOptions.length > 0 && (
        <SortCardsForm
          options={sortOptions}
          activeSort={currentSort}
          onSortChange={setCurrentSort}
        />
      )}

      <div className={styles.content}>
        {children ? (
          children
        ) : (
          <CardList type={type} items={data} onAddClick={onAddClick} />
        )}
      </div>
    </div>
  );
};

export default Main;
