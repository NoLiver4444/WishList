import styles from './Main.module.css'
import SortCardsForm from "@/features/sortingCards/index.js";

const Main = () => {
  return (
    <main
      className={styles.main}
    >
      <h1 className={styles.title}>Вишлисты</h1>
      <SortCardsForm />
    </main>
  )
}

export default Main