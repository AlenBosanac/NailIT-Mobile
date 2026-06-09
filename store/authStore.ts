import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  fullName: string | null;
  email: string | null;
  role: string | null;
  siteId: string | null;
  _hasHydrated: boolean;
  setSiteId: (siteId: string) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
  token :string | null;
  setAuth: (fullName: string, email: string, role: string, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      fullName: null,
      email: null,
      role: null,
      siteId: null,
      _hasHydrated: false,
      setSiteId: (siteId) => set({ siteId }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      token: null,
      setAuth: (fullName, email, role, token) => set({ fullName, email, role, token }),
      logout: () => set({ fullName: null, email: null, role: null, siteId: null, token: null }),
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