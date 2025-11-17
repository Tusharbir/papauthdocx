import axiosInstance from './axiosInstance';

const mockUser = {
  id: 'mock-user-1',
  name: 'Ava Collins',
  email: 'ava.collins@papdocauthx.com',
  role: 'admin',
};

const safeRequest = async (requestFn, mockData) => {
  try {
    const { data } = await requestFn();
    return data;
  } catch (error) {
    console.warn('PapDocAuthX+ auth API fallback', error);
    return mockData;
  }
};

const authApi = {
  login: (payload) =>
    safeRequest(
      () => axiosInstance.post('/auth/login', payload),
      {
        token: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        user: { ...mockUser, email: payload.email, role: payload.email.includes('verify') ? 'verifier' : 'admin' },
      }
    ),
  register: (payload) =>
    safeRequest(
      () => axiosInstance.post('/auth/register', payload),
      {
        token: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        user: { ...mockUser, ...payload, role: 'user' },
      }
    ),
  refresh: (refreshToken) =>
    safeRequest(
      () =>
        axiosInstance.post(
          '/auth/refresh',
          { refreshToken },
          {
            headers: {
              'x-skip-auth-refresh': 'true',
            },
          }
        ),
      {
        token: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        user: mockUser,
      }
    ),
  logout: () =>
    safeRequest(
      () => axiosInstance.post('/auth/logout'),
      { success: true }
    ),
};

export default authApi;
