import { showAppToast } from "../component";

export const handleApiError = (error: any, defaultMessage = 'Something went wrong. Please try again.') => {
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

export const handleApiFailureResponse = (response: any, fallbackMessage = 'Something went wrong.') => {
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

export const handleSuccessToast = (message: string = 'Success!') => {
  showAppToast({
    title: 'Success',
    message,
    type: 'success',
    timeout: 3000,
  });
};
