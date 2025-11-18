import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { storage } from '../utils/storage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.papdocauthx.local';
const refreshClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

const safeDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

const initialToken = typeof window !== 'undefined' ? storage.getToken() : null;
const initialRefresh = typeof window !== 'undefined' ? storage.getRefreshToken() : null;
const initialUser = typeof window !== 'undefined' ? storage.getUser() : null;
const initialRole = initialUser?.role || (initialToken ? safeDecode(initialToken)?.role : null);

const useAuthStore = create((set, get) => ({
  token: initialToken,
  refreshToken: initialRefresh,
  user: initialUser,
  role: initialRole,
  isAuthenticated: Boolean(initialToken),
  setSession: ({ token, refreshToken, user }) => {
    const decoded = user || (token ? safeDecode(token) : null);
    const nextUser = decoded || user || get().user;
    const nextRole = nextUser?.role || get().role || 'user';
    storage.setSession({ token, refreshToken, user: nextUser });
    set({
      token,
      refreshToken: refreshToken || get().refreshToken,
      user: nextUser,
      role: nextRole,
      isAuthenticated: Boolean(token),
    });
  },
  logout: () => {
    storage.clear();
    set({
      token: null,
      refreshToken: null,
      user: null,
      role: null,
      isAuthenticated: false,
    });
  },
  refreshSession: async () => {
    const refreshToken = get().refreshToken || storage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const { data } = await refreshClient.post('/api/auth/refresh', { refreshToken });
      const nextUser = data.user || get().user;
      storage.setSession({ token: data.token, refreshToken: data.refreshToken || refreshToken, user: nextUser });
      set({
        token: data.token,
        refreshToken: data.refreshToken || refreshToken,
        user: nextUser,
        role: nextUser?.role || get().role,
        isAuthenticated: true,
      });
      return data.token;
    } catch (error) {
      storage.clear();
      set({ token: null, refreshToken: null, user: null, role: null, isAuthenticated: false });
      throw error;
    }
  },
  setUserRole: (role) => set((state) => ({ ...state, role })),
}));

export default useAuthStore;
