import {useState} from "react";
import SortCardsForm from "@/features/sort-cards";
import CardList from "@/entities/ui/CardList";
import styles from './Main.module.css'

const Main = () => {
  const [currentSort, setCurrentSort] = useState('date_added');

  const sortOptions = [
    {label: 'дате добавления', value: 'date_added'},
    {label: 'названию', value: 'name'},
    {label: 'дате события', value: 'event_date'},
  ];

  return (
    <main
      className={styles.main}
    >
      <h1 className={styles.title}>Вишлисты</h1>
      <SortCardsForm
        options={sortOptions}
        activeSort={currentSort}
        onSortChange={setCurrentSort}
      />
      <CardList />
    </main>
  );
};

export default Main;