import { showAppToast } from "../component";
import i18next from "i18next";
export const handleApiError = (error: any, defaultMessage = i18next.t('messages.somethingWentWrong')) => {
  console.error('API Error:', error);

  const message =
    error?.data?.message ||
    error?.error?.message ||
    error?.message ||
    defaultMessage;

  showAppToast({
    title: 'Error',
    message,
    type: 'error',
    timeout: 3000,
  });
};

export const handleApiFailureResponse = (response: any, fallbackMessage = i18next.t('messages.somethingWentWrong')) => {
  const message =
    response?.message ||
    response?.error?.message ||
    response?.error?.data?.message ||
    fallbackMessage;

  showAppToast({
    title: 'Error',
    message,
    type: 'error',
    timeout: 3000,
  });
};

export const handleSuccessToast = (message: string = i18next.t('messages.success')) => {
  showAppToast({
    title: 'Success',
    message,
    type: 'success',
    timeout: 3000,
  });
};
