/**
 * @file Состояние (Store) для работы с вишлистами.
 * @module entities/calendar/model/store
 */

import { create } from 'zustand';
import { WISHLISTS_MOCK } from './mock.js';

/**
 * Hook-хранилище для управления данными вишлистов.
 * Использует Zustand для обеспечения глобального доступа к данным.
 * * @typedef {Object} WishlistState
 * @property {Array<Object>} wishlists - Массив объектов вишлистов.
 * @property {function(Array<Object>): void} setWishlists - Функция обновления списка вишлистов.
 * * @returns {import('zustand').UseBoundStore<import('zustand').StoreApi<WishlistState>>}
 */
export const useWishlistStore = create((set) => ({
  wishlists: WISHLISTS_MOCK,
  setWishlists: (wishlists) => set({ wishlists }),
}));

/**
 * Селектор для получения только списка вишлистов из стейта.
 * Используется для оптимизации рендеринга (подписка только на часть стора).
 * * @function selectWishlists
 * @param {WishlistState} state - Текущее состояние стора.
 * @returns {Array<Object>} Список вишлистов.
 */
export const selectWishlists = (state) => state.wishlists;
