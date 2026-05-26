import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  fullName: string | null;
  email: string | null;
  role: string | null;
  siteId: string | null;
  _hasHydrated: boolean;
  setAuth: (fullName: string, email: string, role: string) => void;
  setSiteId: (siteId: string) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      fullName: null,
      email: null,
      role: null,
      siteId: null,
      _hasHydrated: false,
      setAuth: (fullName, email, role) => set({ fullName, email, role }),
      setSiteId: (siteId) => set({ siteId }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      logout: () => set({ fullName: null, email: null, role: null, siteId: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);