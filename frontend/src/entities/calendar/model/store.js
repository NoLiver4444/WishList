/**
 * @file Состояние (Store) для работы с вишлистами.
 * @module entities/calendar/model/store
 */

import { create } from 'zustand';
import { fetchWishlists } from '@/entities/api/wishlists.api';

/**
 * @typedef {Object} Wishlist
 * @property {string|number} id
 * @property {string} name       - название (поле из API)
 * @property {string} [deadline] - ISO дата дедлайна
 */
export const useWishlistStore = create((set) => ({
  wishlists: [],
  loading: false,
  error: null,

  fetchWishlists: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchWishlists();
      const list = Array.isArray(data) ? data : (data.items ?? []);
      set({ wishlists: list });
    } catch (err) {
      set({ error: err.message ?? 'Ошибка загрузки вишлистов' });
    } finally {
      set({ loading: false });
    }
  },
}));

/**
 * Селектор для получения только списка вишлистов из стейта.
 * Используется для оптимизации рендеринга (подписка только на часть стора).
 * * @function selectWishlists
 * @param {state} state - Текущее состояние стора.
 * @returns {Array<Object>} Список вишлистов.
 */
export const selectWishlists = (state) => state?.wishlists;
export const selectWishlistsLoading = (state) => state.loading;
