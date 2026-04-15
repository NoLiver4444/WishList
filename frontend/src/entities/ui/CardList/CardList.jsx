import AddCard from '@/shared/ui/AddCard';
import Card from '@/shared/ui/Card';

const CardList = ({ type, items = [], onAddClick }) => {
  const titles = {
    wishes: 'Добавить желание',
    wishlists: 'Создать вишлист',
    friends: 'Добавить друга',
  };
  const addCardTitle = titles[type] || 'Добавить';

  return (
    <ul>
      <AddCard title={addCardTitle} onClick={onAddClick} type={type} />

      {items.map((item) => (
        <Card
          key={item.id}
          name={item.name}
          date={item.date}
          counts={item.counts}
          wishes={item.wishes}
          type={type}
        />
      ))}

      {items.length === 0 && <></>}
    </ul>
  );
};

export default CardList;
