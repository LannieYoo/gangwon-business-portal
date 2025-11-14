/**
 * UI State Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getStorage, setStorage } from '@shared/utils/storage';
import { STORAGE_KEYS, DEFAULT_LANGUAGE } from '@shared/utils/constants';

export const useUIStore = create(
  devtools(
    (set) => ({
      language: getStorage(STORAGE_KEYS.LANGUAGE, DEFAULT_LANGUAGE),
      sidebarCollapsed: getStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
      theme: getStorage(STORAGE_KEYS.THEME, 'light'),
      
      setLanguage: (language) => {
        setStorage(STORAGE_KEYS.LANGUAGE, language);
        set({ language });
      },
      
      toggleSidebar: () =>
        set((state) => {
          const collapsed = !state.sidebarCollapsed;
          setStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
          return { sidebarCollapsed: collapsed };
        }),
      
      setSidebarCollapsed: (collapsed) => {
        setStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
        set({ sidebarCollapsed: collapsed });
      },
      
      setTheme: (theme) => {
        setStorage(STORAGE_KEYS.THEME, theme);
        set({ theme });
      },
      
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          setStorage(STORAGE_KEYS.THEME, newTheme);
          return { theme: newTheme };
        })
    }),
    { name: 'UIStore' }
  )
);

