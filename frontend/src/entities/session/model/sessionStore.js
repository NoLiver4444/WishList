import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSessionStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuth: false,

      setSession: (token, user) => set({ token, user, isAuth: true }),
      clearSession: () => set({ token: null, user: null, isAuth: false }),
    }),
    { name: 'session' }
  )
);
