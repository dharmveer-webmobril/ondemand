import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@store/index';
import { setIsUserActiveOrNotModal, setInactiveMessage } from '@store/slices/appSlice';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { navigationRef } from '@utils/NavigationUtils';

// Base URL - Update this with your API base URL
const BASE_URL = 'http://52.22.241.165:10054/api'; // Replace with your actual base URL

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor - Auto add token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData = config.data instanceof FormData;
    // console.log('isFormData-----', isFormData);
    if (isFormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log('AXIOS REQUEST', {
      url: config.url,
      isFormData,
      headers: config.headers,
      token,
    });

    return config;
  },
  error => Promise.reject(error)
);


// Response interceptor - Handle unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.log('AXIOS ERROR RESPONSE------logout', error.response?.data);
    if (error.response?.status === 401) {
      const currentRoute = navigationRef.getCurrentRoute();
      const isLoginScreen = currentRoute?.name === SCREEN_NAMES.LOGIN || currentRoute?.name === SCREEN_NAMES.SIGNUP || currentRoute?.name === SCREEN_NAMES.OTP_VERIFY || currentRoute?.name === SCREEN_NAMES.CHANGE_PASSWORD;
      if (!isLoginScreen) {
        store.dispatch(setIsUserActiveOrNotModal(true));
        store.dispatch(setInactiveMessage('You are not authorized to access this resource'));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
