// Example query file - This demonstrates how to create queries
// You can create similar files for different features (e.g., userQueries.ts, productQueries.ts, etc.)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { ApiResponse } from '../index';
import EndPoints from '../EndPoints';

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

// Example: Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.put<ApiResponse>(EndPoints.UPDATE_PROFILE, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
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
      return response.data;
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
  interests: string[];
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
      const response = await axiosInstance.post<SubmitInterestsResponse>(EndPoints.SUBMIT_INTERESTS, data);
      return response.data;
    },
  });
};
