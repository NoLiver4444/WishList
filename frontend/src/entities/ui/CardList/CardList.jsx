import AddCard from '@/shared/ui/AddCard';
import Card from '@/shared/ui/Card';

const CardList = ({ type, items = [], onAddClick, onEdit, onDelete }) => {
  const titles = {
    wishes: 'Добавить желание',
    wishlists: 'Создать вишлист',
    friends: 'Добавить друга',
  };

  return (
    <ul>
      <AddCard title={titles[type]} onClick={onAddClick} type={type} />
      {items.map((item) => (
        <Card
          key={item.id}
          item={item}
          type={type}
          onAddWish={onAddClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default CardList;
