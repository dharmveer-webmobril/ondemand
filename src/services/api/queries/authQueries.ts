// Example query file - This demonstrates how to create queries
// You can create similar files for different features (e.g., userQueries.ts, productQueries.ts, etc.)

import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { ApiResponse } from '../index';
import EndPoints from '../EndPoints';
import axios from 'axios';
const BASE_URL = 'http://52.22.241.165:10054/api';
// Example: Get user profile
export const useGetUserProfile = (userId: string | null) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await axiosInstance.get<ApiResponse>(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId, // Only run query if userId exists
  });
};

export const useProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axiosInstance.get(EndPoints.GET_PROFILE);
      return response.data;
    },
    enabled: enabled,
    staleTime: 0,
  });
};

export const useProfileSplashScreen = (enabled: boolean = true, token: string | null) => {
  return useQuery({
    queryKey: ['profileSplashScreen', token],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}${EndPoints.GET_PROFILE}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: enabled,
    staleTime: 0,
  });
};

// Login mutation for service provider
export interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post<any>(EndPoints.LOGIN, data);
      console.log();
      return response.data;
    },
    onError: (error: any) => {
      console.log('❌ Login Error Message:', error.message);
      console.log('❌ Status Code:', error.response?.status);
      console.log('❌ API Response:', error.response?.data);
    },
  });
};

// Signup mutation for service provider
export interface SignupData {
  name: string;
  email: string;
  password: string;
  contact: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface SignupResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    spId: string;
    email: string;
    otp: string;
  };
}

export const useSignup = () => {
  return useMutation<any, Error, SignupData>({
    mutationFn: async (data: SignupData) => {
      const response = await axiosInstance.post<SignupResponse>(EndPoints.SIGNUP, data);
      return response.data;
    },
  });
};

// OTP Verification
export interface VerifyOtpData {
  email: string;
  otp: string;
  otpType: string;
}

export interface VerifyOtpResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    token: string;
    sp: {
      _id: string;
      name: string;
      email: string;
      contact: string;
      profileImage: string | null;
      city: string;
      country: string;
      subscription: boolean;
      status: boolean;
      coordinates: {
        lat: number;
        lng: number;
      };
      [key: string]: any;
    };
  };
}

export const useVerifyOtp = () => {

  return useMutation<any, Error, VerifyOtpData>({
    mutationFn: async (data: VerifyOtpData) => {
      console.log('data-----', data);
      const response = await axiosInstance.post<any>(EndPoints.VERIFY_OTP, data);
      return response.data;
    },
  });
};

// Resend OTP (for future implementation)
export interface ResendOtpData {
  email: string;
}

export interface ResendOtpResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    otp: string;
  };
}

export const useResendOtp = () => {
  return useMutation<ResendOtpResponse, Error, ResendOtpData>({
    mutationFn: async (data: ResendOtpData) => {
      const response = await axiosInstance.post<ResendOtpResponse>(EndPoints.RESEND_OTP, data);
      return response.data;
    },
  });
};

// Forgot Password - Send OTP
export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    otp: string;
    expiresIn: string;
  };
}

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordData>({
    mutationFn: async (data: ForgotPasswordData) => {
      console.log('data-----', data);
      const response = await axiosInstance.post<ForgotPasswordResponse>(EndPoints.FORGOT_PASSWORD, data);
      return response.data;
    },
  });
};

// Reset Password
export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: any;
}

export const useResetPassword = () => {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordData>({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await axiosInstance.post<ResetPasswordResponse>(EndPoints.RESET_PASSWORD, data);
      return response.data;
    },
  });
};

// Submit Interests
export interface SubmitInterestsData {
  categoryIds: string[];
  enum: string
}

export interface SubmitInterestsResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: any;
}

export const useSubmitInterests = () => {
  return useMutation<SubmitInterestsResponse, Error, SubmitInterestsData>({
    mutationFn: async (data: SubmitInterestsData) => {
      const response = await axiosInstance.post<SubmitInterestsResponse>(EndPoints.ADD_CUSTOMER_INTEREST, data);
      return response.data;
    },
    onError: (error: any) => {
      console.log('❌ Login Error Message:', error.message);
      console.log('❌ Status Code:', error.response?.status);
      console.log('❌ API Response:', error.response?.data);
    },
  });
};


export const useUpdateProfile = () => {
  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      console.log('data------useUpdateProfile', data);
      const response = await axiosInstance.put<any>(EndPoints.UPDATE_PROFILE_1, data);
      return response.data;
    },
    onError: (error: any) => {
      console.log('❌ Login Error Message:', error.message);
      console.log('❌ Status Code:', error.response?.status);
      console.log('❌ API Response:', error.response?.data);
    },
  });
};

export const useChangePassword = () => {
  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.put<any>(EndPoints.CHANGE_PASSWORD, data);
      return response.data;
    },
    onError: (error: any) => {
      console.log('❌ Login Error Message:', error.message);
      console.log('❌ Status Code:', error.response?.status);
      console.log('❌ API Response:', error.response?.data);
    },
  });
};