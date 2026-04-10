import Main from "@/widgets/Main";

const ProductsPage = () => {
  const sortOptions = [
    {label: 'дате добавления', value: 'date_added'},
    {label: 'названию', value: 'name'},
    {label: 'цене', value: 'price'},
  ];

  const handleAdd = () => {
    console.log("Модалка добавления желания");
  };

  return (
    <Main
      title="Мои желания"
      variant="wishes"
      type="wishes"
      sortOptions={sortOptions}
      onAddClick={handleAdd}
    />
  );
};

export default ProductsPage;