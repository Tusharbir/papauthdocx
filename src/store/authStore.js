import { create } from 'zustand';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.papdocauthx.local';
const refreshClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

const safeDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  role: null,
  isAuthenticated: false,
  setSession: ({ token, refreshToken, user }) => {
    const decoded = user || (token ? safeDecode(token) : null);
    set({
      token,
      refreshToken: refreshToken || get().refreshToken,
      user: decoded,
      role: decoded?.role || user?.role || get().role || 'user',
      isAuthenticated: Boolean(token),
    });
  },
  logout: () =>
    set({
      token: null,
      refreshToken: null,
      user: null,
      role: null,
      isAuthenticated: false,
    }),
  refreshSession: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return null;
    try {
      const { data } = await refreshClient.post('/auth/refresh', { refreshToken });
      set({
        token: data.token,
        refreshToken: data.refreshToken || refreshToken,
        user: data.user || get().user,
        role: (data.user || get().user)?.role || get().role,
        isAuthenticated: true,
      });
      return data.token;
    } catch (error) {
      set({ token: null, refreshToken: null, user: null, role: null, isAuthenticated: false });
      throw error;
    }
  },
  setUserRole: (role) => set((state) => ({ ...state, role })),
}));

export default useAuthStore;
