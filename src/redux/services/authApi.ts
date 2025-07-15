// src/redux/services/authEndpoints.ts
import { api } from "./api";
import { ENDPOINTS, LoginRequest, RegisterRequest, ResenOtpReq, VerifyOtpReq } from "../../utils";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, LoginRequest>({
      query: (credentials) => ({
        url: ENDPOINTS.LOGIN,
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<any, RegisterRequest>({
      query: (userData) => ({
        url: ENDPOINTS.REGISTER,
        method: "POST",
        body: userData,
      }),
    }),
    resendOtp: builder.mutation({
      query: (token) => ({
        url: ENDPOINTS.RESEND_OTP,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    verifyOtp: builder.mutation<any, { otpData: VerifyOtpReq; token: string }>({
      query: ({ otpData, token }) => ({
        url: ENDPOINTS.VERIFY_OTP,
        method: "POST",
        body: otpData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    forgetPassword: builder.mutation({
      query: ({ email }) => {
        return {
          url: ENDPOINTS.FORGOT_OTP,
          method: "POST",
          body: { email },
        };
      },
    }),
    resetPassword: builder.mutation<any, { data: any; token: string }>({
      query: ({ data, token }) => ({
        url: ENDPOINTS.RESET_PASS,
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
    getUserProfile: builder.query<any, void>({
      query: () => ({
        url: "/getprofile",
        method: "GET",
      }),
    }),
    getTermAndCond: builder.query<any, void>({
      query: () => ({
        url: "/gettermsconditions",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetUserProfileQuery,
  useGetTermAndCondQuery,
} = authApi;
