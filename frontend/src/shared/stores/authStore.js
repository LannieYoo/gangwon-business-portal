/**
 * Authentication Store (Zustand)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import authService from '@shared/services/auth.service';
import { storeLogger } from './storeLogger';

export const useAuthStore = create(
  devtools(
    storeLogger('AuthStore')(
      (set) => ({
        user: authService.getCurrentUserFromStorage(),
        isAuthenticated: authService.isAuthenticated(),
        isLoading: false,
        
        setUser: (user) => set({ user, isAuthenticated: true }, false, 'setUser'),
        
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }, false, 'setAuthenticated'),
        
        setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
        
        clearAuth: () => {
          authService.clearAuth();
          set({ user: null, isAuthenticated: false }, false, 'clearAuth');
        },
        
        logout: async () => {
          await authService.logout();
          set({ user: null, isAuthenticated: false }, false, 'logout');
        }
      })
    ),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;
