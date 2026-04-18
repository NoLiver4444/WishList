import { apiClient } from '@/shared/api/apiClient';

export const fetchWishlists = () =>
	apiClient('/v1/wishlists');

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