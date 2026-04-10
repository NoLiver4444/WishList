import Main from "@/widgets/Main/index.js";

const WishlistsPage = () => {
  const sortOptions = [
    {label: 'дате добавления', value: 'date_added'},
    {label: 'названию', value: 'name'},
    {label: 'количеству желаний', value: 'count_products'},
    {label: 'дедлайну', value: 'deadline'},
  ];

  const handleAdd = () => {
    console.log("Модалка добавления вишлиста");
  };

  return (
    <Main
      title="Мои вишлисты"
      variant="wishlists"
      type="wishlists"
      sortOptions={sortOptions}
      onAddClick={handleAdd}
      data={[]}
    />
  );
};

export default WishlistsPage;