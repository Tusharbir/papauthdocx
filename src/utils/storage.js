const TOKEN_KEY = 'papdocauthx-token';
const REFRESH_KEY = 'papdocauthx-refresh-token';
const USER_KEY = 'papdocauthx-user';

export const storage = {
  getToken: () => window.localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => window.localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    const raw = window.localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Unable to parse stored user', err);
      return null;
    }
  },
  setSession: ({ token, refreshToken, user }) => {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_KEY, refreshToken);
    }
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  clear: () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};

export default storage;
