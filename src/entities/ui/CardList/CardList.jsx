import AddCard from "@/features/add-card/AddCard";
import Card from "@/shared/ui/Card";

const CardList = ({type, items = [], onAddClick}) => {
  const titles = {
    wishes: 'Добавить желание',
    wishlists: 'Создать вишлист',
    friends: 'Добавить друга',
  }
  const addCardTitle = titles[type] || 'Добавить';

  return (
    <ul>
      <AddCard
        title={addCardTitle}
        onClick={onAddClick}
      />

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

      {items.length === 0 && (
        <>
          <Card
            name="Подвал Севы"
            date="10.04.2026"
            counts={0}
            wishes={[]}
            onMenuClick={() => {
            }}
            type={type}
          />
          <Card
            name="Подвал Озара"
            date="12.04.2026"
            counts={5}
            wishes={[]}
            onMenuClick={() => {
            }}
            type={type}
          />
        </>
      )}
    </ul>
  );
};

export default CardList;