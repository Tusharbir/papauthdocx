import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getSummary: async () => {
    const { data } = await axiosInstance.get('/api/analytics/summary');
    return data;
  },
};

export default analyticsApi;
