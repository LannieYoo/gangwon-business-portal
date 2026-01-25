// Stores 理想代码示例

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// =============================================================================
// useExampleStore - 示例 Store
// =============================================================================

export const useExampleStore = create(
  devtools(
    (set) => ({
      data: null,
      loading: false,
      error: null,

      setData: (data) => set({ data }, false, 'setData'),

      setLoading: (loading) => set({ loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      clearData: () => set({ data: null, error: null }, false, 'clearData'),

      reset: () => set({ data: null, loading: false, error: null }, false, 'reset'),
    }),
    { name: 'ExampleStore' }
  )
);

// =============================================================================
// useAuthStore - 认证 Store
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
// useUIStore - UI 状态 Store
// =============================================================================

export const useUIStore = create(
  devtools(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      language: 'ko',

      setTheme: (theme) => set({ theme }, false, 'setTheme'),

      toggleTheme: () => set(
        (state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }),
        false,
        'toggleTheme'
      ),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),

      toggleSidebar: () => set(
        (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
        false,
        'toggleSidebar'
      ),

      setLanguage: (language) => set({ language }, false, 'setLanguage'),
    }),
    { name: 'UIStore' }
  )
);
