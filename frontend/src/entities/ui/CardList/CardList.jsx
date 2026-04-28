/**
 * @file Компонент для отображения списка карточек.
 * @module entities/ui/CardList
 */

import { memo } from 'react';
import AddCard from '@/shared/ui/Cards/AddCard';
import Card from '@/shared/ui/Cards/Card';

/**
 * Компонент CardList.
 * Универсальный список, который адаптирует заголовок кнопки добавления
 * в зависимости от типа контента (желания, вишлисты или друзья).
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {'wishes'|'wishlists'|'friends'} props.type - Тип отображаемых данных.
 * @param {Array<Object>} [props.items=[]] - Массив данных для отрисовки карточек.
 * @param {Function} props.onAddClick - Коллбэк для открытия модалки создания.
 * @param {Function} [props.onEdit] - Функция для редактирования элемента.
 * @param {Function} [props.onDelete] - Функция для удаления элемента.
 * * @returns {React.ReactElement} Список <ul> с набором компонентов Card.
 */
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

export default memo(CardList);
