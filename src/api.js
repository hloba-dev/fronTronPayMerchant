import axios from 'axios';
import { getAccessToken, setAccessToken as setAccessTokenGlobal } from './tokenStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const setupInterceptors = (auth) => {
  api.interceptors.request.use(
    (config) => {
      // As instructed, DO NOT add the Authorization header to the refresh token request
      const token = getAccessToken();
      if (token && config.url !== '/admin/refresh') {
        if (!config.headers) config.headers = {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // The crucial change: DO NOT retry the refresh token request itself.
      if (error.response?.status === 401 && originalRequest.url !== '/admin/refresh' && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await auth.refreshAccessToken();
          setAccessTokenGlobal(newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout the user completely.
          auth.logout(); 
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api; 