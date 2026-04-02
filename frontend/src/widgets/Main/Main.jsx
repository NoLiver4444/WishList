import styles from './Main.module.css'
import SortCardsForm from "@/features/sortingCards";
import CardList from "@/entities/ui/CardList";

const Main = () => {
  return (
    <main
      className={styles.main}
    >
      <h1 className={styles.title}>Вишлисты</h1>
      <SortCardsForm />
      <CardList />
    </main>
  )
}

export default Main