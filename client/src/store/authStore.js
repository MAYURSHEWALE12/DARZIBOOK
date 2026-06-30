import { create } from 'zustand';
import { getMe } from '../api/auth.js';

const useAuthStore = create((set) => ({
  tenant: null,
  isAuthenticated: false,
  isLoading: true,
  setTenant: (tenant) => set({ tenant, isAuthenticated: !!tenant, isLoading: false }),
  fetchTenant: async () => {
    try {
      const { data } = await getMe();
      set({ tenant: data.tenant, isAuthenticated: true, isLoading: false });
    } catch {
      set({ tenant: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: () => set({ tenant: null, isAuthenticated: false }),
}));

export default useAuthStore;
