import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import i18next from 'i18next';
import { store } from '@store/index';
import { setIsUserActiveOrNotModal, setInactiveMessage } from '@store/slices/appSlice';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { navigationRef } from '@utils/NavigationUtils';
import { getApiLocaleHeaders } from '@utils/apiLocaleHeaders';

// Base URL - Update this with your API base URL
export const BASE_URL = 'https://indoredev.webmobrildemo.com:10054/api';
/** Web origin for profile share pages (no `/api` suffix) */
export const PROFILE_SHARE_HOST = 'https://indoredev.webmobrildemo.com:10054';

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
    if (isFormData) {
      config.headers.set('Content-Type', 'multipart/form-data');
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    const localeHeaders = getApiLocaleHeaders();
    config.headers['X-Currency'] = localeHeaders['X-Currency'];
    config.headers['X-Country-Iso2'] = localeHeaders['X-Country-Iso2'];
    config.headers['Accept-Language'] = localeHeaders['Accept-Language'];

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
    console.log('AXIOS ERROR RESPONSE----', error);
    console.log('AXIOS ERROR RESPONSE------logout', error.response?.data);

    if (error.response?.status === 401) {
      const currentRoute = navigationRef.getCurrentRoute();
      const isAuthScreen =
        currentRoute?.name === SCREEN_NAMES.LOGIN ||
        currentRoute?.name === SCREEN_NAMES.SIGNUP ||
        currentRoute?.name === SCREEN_NAMES.OTP_VERIFY ||
        currentRoute?.name === SCREEN_NAMES.CHANGE_PASSWORD;
      const isSplashScreen = currentRoute?.name === SCREEN_NAMES.SPLASH;
      const hasToken = !!store.getState().auth.token;

      // Skip modal during splash / before token hydration, or when no session exists.
      if (!isAuthScreen && !isSplashScreen && hasToken) {
        store.dispatch(setIsUserActiveOrNotModal(true));
        store.dispatch(setInactiveMessage(i18next.t('common.unauthorized')));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
