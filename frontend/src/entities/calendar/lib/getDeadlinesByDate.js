export const getDeadlinesByDate = (wishlists, date) => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	const key = `${y}-${m}-${d}`;

	return wishlists.filter((w) => w.deadline === key);
};
