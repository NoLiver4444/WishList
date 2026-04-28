/**
 * @file Хранилище сессий пользователей.
 * @module shared/model/sessionStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {Object} User
 * @property {number|string} id - Уникальный идентификатор пользователя.
 * @property {string} [name] - Имя пользователя.
 * @property {string} [email] - Электронная почта.
 * @property {string} [avatarUrl] - Ссылка на аватар.
 */

/**
 * @typedef {Object} SessionAccount
 * @property {string} token - JWT или другой идентификатор сессии.
 * @property {User} user - Данные профиля пользователя.
 */

/**
 * @typedef {Object} SessionState
 * @property {SessionAccount[]} accounts - Список активных аккаунтов.
 * @property {number} activeIndex - Индекс текущего выбранного аккаунта.
 * @property {function(): User|null} currentUser - Геттер для получения данных текущего пользователя.
 * @property {function(): string|null} token - Геттер для получения текущего токена.
 * @property {function(): boolean} isAuth - Проверка наличия хотя бы одной активной сессии.
 * @property {function(string, User): void} addAccount - Добавление нового аккаунта или переключение на существующий.
 * @property {function(number): void} switchAccount - Переключение между аккаунтами по индексу.
 * @property {function(): void} logout - Удаление текущего аккаунта из сессии.
 * @property {function(Partial<User>): void} updateCurrentUser - Обновление данных текущего пользователя.
 */

/**
 * Хук для управления состоянием сессий.
 * Поддерживает мультиаккаунтность и сохранение данных в LocalStorage.
 * * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<SessionState>>}
 */
export const useSessionStore = create(
  persist(
    (set, get) => ({
      accounts: [],
      activeIndex: 0,

      currentUser: () => get().accounts[get().activeIndex]?.user ?? null,
      token: () => get().accounts[get().activeIndex]?.token ?? null,
      isAuth: () => get().accounts.length > 0,

      addAccount: (token, user) => {
        const accounts = get().accounts;
        const existing = accounts.findIndex((a) => a.user.id === user.id);
        if (existing !== -1) {
          set({ activeIndex: existing });
          return;
        }
        set({
          accounts: [...accounts, { token, user }],
          activeIndex: accounts.length,
        });
      },

      switchAccount: (index) => set({ activeIndex: index }),

      logout: () => {
        const accounts = get().accounts;
        const activeIndex = get().activeIndex;
        const next = accounts.filter((_, i) => i !== activeIndex);
        set({
          accounts: next,
          activeIndex: Math.min(activeIndex, next.length - 1),
        });
      },
      updateCurrentUser: (user) => {
        const accounts = get().accounts;
        const activeIndex = get().activeIndex;
        const updated = accounts.map((a, i) =>
          i === activeIndex ? { ...a, user: { ...a.user, ...user } } : a
        );
        set({ accounts: updated });
      },
    }),
    { name: 'session' }
  )
);
