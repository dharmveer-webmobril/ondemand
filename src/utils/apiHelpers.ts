import { showToast } from '@components/common/CustomToast';

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  const errorMessage = 
    error?.response?.data?.ResponseMessage || 
    error?.response?.data?.message ||
    error?.message || 
    'Something went wrong. Please try again.';
  
  showToast({
    type: 'error',
    title: 'Error',
    message: errorMessage,
  });
};

export const handleSuccessToast = (message: string) => {
  showToast({
    type: 'success',
    title: 'Success',
    message: message,
  });
};

export const handleApiFailureResponse = (response: any, defaultMessage: string = '') => {
  const errorMessage = 
    response?.ResponseMessage || 
    response?.message ||
    defaultMessage || 
    'Operation failed. Please try again.';
  
  showToast({
    type: 'error',
    title: 'Error',
    message: errorMessage,
  });
};
