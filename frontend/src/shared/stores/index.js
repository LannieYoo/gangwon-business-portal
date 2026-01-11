// Zustand 状态管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getStorage, setStorage } from '@shared/utils';
import { STORAGE_KEYS, DEFAULT_LANGUAGE } from '@shared/utils/constants';

// =============================================================================
// useAuthStore - 认证状态
// =============================================================================

export const useAuthStore = create(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }, false, 'setUser'),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }, false, 'setAuthenticated'),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      clearAuth: () => set({ user: null, isAuthenticated: false }, false, 'clearAuth'),
    }),
    { name: 'AuthStore' }
  )
);

// =============================================================================
// useUIStore - UI 状态
// =============================================================================

export const useUIStore = create(
  devtools(
    (set) => ({
      language: getStorage(STORAGE_KEYS.LANGUAGE, DEFAULT_LANGUAGE),
      sidebarCollapsed: getStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
      theme: getStorage(STORAGE_KEYS.THEME, 'light'),

      setLanguage: (language) => {
        setStorage(STORAGE_KEYS.LANGUAGE, language);
        set({ language }, false, 'setLanguage');
      },

      toggleSidebar: () =>
        set((state) => {
          const collapsed = !state.sidebarCollapsed;
          setStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
          return { sidebarCollapsed: collapsed };
        }, false, 'toggleSidebar'),

      setSidebarCollapsed: (collapsed) => {
        setStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed');
      },

      setTheme: (theme) => {
        setStorage(STORAGE_KEYS.THEME, theme);
        set({ theme }, false, 'setTheme');
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          setStorage(STORAGE_KEYS.THEME, newTheme);
          return { theme: newTheme };
        }, false, 'toggleTheme'),
    }),
    { name: 'UIStore' }
  )
);
