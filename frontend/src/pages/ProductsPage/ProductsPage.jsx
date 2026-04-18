import { useEffect, useState } from 'react';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/ui/AddCardModal';

const ProductsPage = () => {
	const [items, setItems] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem('wishes')) ?? [];
		} catch {
			return [];
		}
	});
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		localStorage.setItem('wishes', JSON.stringify(items));
	}, [items]);

	const sortOptions = [
		{label: 'по дате добавления', value: 'date_added'},
		{label: 'по названию', value: 'name'},
		{label: 'по цене', value: 'price'},
		{label: 'по дате события', value: 'deadline'},
	];

	const handleAdd = (newItem) => {
		setItems((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				likes: 0,
				...newItem,
			},
		]);
		setIsModalOpen(false);
	};

	return (
		<>
			<Main
				title="Мои желания"
				variant="wishes"
				type="wishes"
				sortOptions={sortOptions}
				onAddClick={() => setIsModalOpen(true)}
				data={items}
			/>

			<AddCardModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleAdd}
				type="wishes"
				title="Добавить желание"
			/>
		</>
	);
};

export default ProductsPage;
