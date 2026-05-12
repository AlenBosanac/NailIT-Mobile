import { create } from 'zustand';

interface AuthState {
  fullName: string | null;
  email: string | null;
  role: string | null;
  siteId: string | null;
  setAuth: (fullName: string, email: string, role: string) => void;
  setSiteId: (siteId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  fullName: null,
  email: null,
  role: null,
  siteId: null,
  setAuth: (fullName, email, role) => set({ fullName, email, role }),
  setSiteId: (siteId) => set({ siteId }),
  logout: () => set({ fullName: null, email: null, role: null, siteId: null }),
}));