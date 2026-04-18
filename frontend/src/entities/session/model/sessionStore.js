import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    }),
    { name: 'session' }
  )
);
