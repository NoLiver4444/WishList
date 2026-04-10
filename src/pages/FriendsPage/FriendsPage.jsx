import Main from "@/widgets/Main";

const FriendsPage = () => {
  const sortOptions = [
    {label: 'дате добавления', value: 'date_added'},
    {label: 'имени', value: 'name'},
    {label: 'дате рождения', value: 'birthday_date'},
  ];

  const handleAdd = () => {
    console.log("Модалка добавления друга");
  };

  return (
    <Main
      title="Мои друзья"
      variant="friends"
      type="friends"
      sortOptions={sortOptions}
      onAddClick={handleAdd}
    />
  );
};

export default FriendsPage;