// Export axios instance and query client
export { default as axiosInstance } from './axiosInstance';
export { queryClient } from './queryClient';

// Export types for API responses (extend as needed)
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// This file can be extended with additional API utilities
// Example: You can add helper functions for common API patterns here

