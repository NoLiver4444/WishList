import { create } from 'zustand';
import { WISHLISTS_MOCK } from './mock.js';


export const useWishlistStore = create((set) => ({
	wishlists: WISHLISTS_MOCK,
	setWishlists: (wishlists) => set({wishlists}),
}));

export const selectWishlists = (state) => state.wishlists;
 