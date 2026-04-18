import { useSessionStore } from '@/entities/session';

export const apiClient = (url, options = {}) => {
	const store = useSessionStore.getState();
	const token = store.accounts[store.activeIndex]?.token;

	return fetch(`${import.meta.env.VITE_API_URL}${url}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token ? {Authorization: `Bearer ${token}`} : {}),
			...options.headers,
		},
	}).then(async r => {
		const data = await r.json();
		if (!r.ok) throw {status: r.status, ...data};
		return data;
	});
};