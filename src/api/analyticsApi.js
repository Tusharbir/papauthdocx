import axiosInstance from './axiosInstance';
import useAuthStore from '../store/authStore';

export const analyticsApi = {
  getSummary: async () => {
    // If user is authenticated, request the protected summary (admin/superadmin)
    const { token } = useAuthStore.getState();
    const url = token ? '/api/analytics/summary' : '/api/analytics/public-summary';

    const { data } = await axiosInstance.get(url);
    // Controller responses use { success: true, data: ... }
    return data.data || data;
  },
};

export default analyticsApi;
