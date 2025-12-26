import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@store/index';
import { logout } from '@store/slices/authSlice';

// Base URL - Update this with your API base URL
const BASE_URL = 'http://52.22.241.165:10054/api'; // Replace with your actual base URL

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Auto add token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - Clear auth state
      store.dispatch(logout());
      // You can also navigate to login screen here if needed
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
