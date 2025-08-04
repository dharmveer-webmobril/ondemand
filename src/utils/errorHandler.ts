import i18next from 'i18next';
import { showAppToast } from '../component';

/**
 * Show error toast on API error (catch block)
 */
export const handleApiError = (
  error: any,
  defaultMessage: string = i18next.t('messages.somethingWentWrong')
) => {
  console.error('API Error:', error);

  const message =
    error?.data?.message ||
    error?.error?.message ||
    error?.message ||
    defaultMessage;

  showAppToast({
    title: i18next.t('messages.error'),
    message,
    type: 'error',
  });
};

/**
 * Show error toast on failed API response
 */
export const handleApiFailureResponse = (
  response: any,
  fallbackMessage: string = i18next.t('messages.somethingWentWrong')
) => {
  const message =
    response?.message ||
    response?.error?.message ||
    response?.error?.data?.message ||
    fallbackMessage;

  showAppToast({
    title: i18next.t('messages.error'),
    message,
    type: 'error',
  });
};

/**
 * Show success toast
 */
export const handleSuccessToast = (
  message: string = i18next.t('messages.success')
) => {
  showAppToast({
    title: i18next.t('messages.success'),
    message,
    type: 'success',
  });
};
