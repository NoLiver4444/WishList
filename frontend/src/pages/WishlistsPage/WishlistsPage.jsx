import Main from '../../widgets/Main/index.js';
import { useState } from 'react';
import AddCardModal from '../../features/add-card/ui/AddCardModal.jsx';

const WishlistsPage = () => {
	const [items, setItems] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const sortOptions = [
		{label: 'дате добавления', value: 'date_added'},
		{label: 'названию', value: 'name'},
		{label: 'количеству желаний', value: 'count_products'},
		{label: 'дедлайну', value: 'deadline'},
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
				title="Мои вишлисты"
				variant="wishlists"
				type="wishlists"
				sortOptions={sortOptions}
				onAddClick={() => setIsModalOpen(true)}
				data={items}
			/>
			<AddCardModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleAdd}
				type="wishlists"
				title="Создать вишлист"
			/>
		</>
	);
};

export default WishlistsPage;
