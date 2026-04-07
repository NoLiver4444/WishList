import styles from './CardList.module.css'
import AddCard from "@/features/add-card/AddCard";
import Card from "@/shared/ui/Card";

const CardList = () => {
  return (
    <ul className={styles.list}>
      <AddCard title={'Добавить подарок'} />
      <Card
        name={'Подвал Севы'}
        date={'14.07.2026'}
        counts={3}
        wishes={['Maka', 'MeowMeow', 'Shiro']}
      />
      <Card
        name={'Подвал Озара'}
        date={'11.09.2026'}
        counts={0}
        wishes={[]}
      />
    </ul>
  )
}

export default CardList