import { apiClient } from '@/shared/api/apiClient';

const BASE = import.meta.env.VITE_API_URL;

export const fetchWishlists = () => apiClient('/v1/wishlists');

export const fetchWishlistItems = (id) =>
	apiClient(`/v1/wishlists/${id}/items`);

export const createWishlist = (body) =>
	apiClient('/v1/wishlists', {
		method: 'POST',
		body: JSON.stringify({
			...body,
			deadline: body.deadline
				? new Date(body.deadline).toISOString()
				: undefined,
		}),
	});

export const fetchPublicWishlist = (id) =>
	fetch(`${BASE}/v1/public/wishlists/${id}`)
		.then(async r => {
			const data = await r.json();
			if (!r.ok) throw {status: r.status, ...data};
			return data;
		});

export const fetchPublicItems = (id) =>
	fetch(`${BASE}/v1/public/wishlists/${id}/items`)
		.then(async r => {
			const data = await r.json();
			if (!r.ok) throw {status: r.status, ...data};
			return data;
		});

export const fetchWishlist = (id) =>
	apiClient(`/v1/wishlists/${id}`);

export const deleteWishlist = (id) =>
	apiClient(`/v1/wishlists/${id}`, {method: 'DELETE'});

export const updateWishlist = (id, body) =>
	apiClient(`/v1/wishlists/${id}`, {
		method: 'PUT',
		body: JSON.stringify({
			...body,
			deadline: body.deadline
				? new Date(body.deadline).toISOString()
				: undefined,
		}),
	});

export const addItem = (wishlistId, body) =>
	apiClient(`/v1/wishlists/${wishlistId}/items`, {
		method: 'POST',
		body: JSON.stringify(body),
	});

export const removeItem = (itemId) =>
	apiClient(`/v1/items/${itemId}`, {method: 'DELETE'});

export const reserveItem = (itemId, action) =>
	apiClient(`/v1/items/${itemId}/reserve`, {
		method: 'POST',
		body: JSON.stringify({action}),
	});