import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import EndPoints from '../EndPoints';

export interface ReferralStats {
  totalReferrals: number;
  bonusCredited: number;
  pending: number;
  totalEarned: number;
}

export interface ReferredUser {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  joinedAt: string;
}

export interface ReferralProgress {
  accountVerified: boolean;
  businessProfile: boolean;
  firstSubscription: boolean;
  firstBookingCompleted: boolean;
}

export interface ReferralListItem {
  id: string;
  referredUser: ReferredUser;
  status: string;
  configuredTrigger: string;
  progress: ReferralProgress;
  referrerBonusAmount: number;
  referredBonusAmount: number;
  referrerBonusCredited: boolean;
  createdAt: string;
  creditedAt: string | null;
  ineligibleReason: string | null;
}

export interface ReferralDashboardData {
  programActive: boolean;
  trigger: string;
  referrerBonus: number;
  referredBonus: number;
  minBookingValue: number;
  currency: string;
  referralCode: string;
  shareLink: string;
  stats: ReferralStats;
  referrals: ReferralListItem[];
}

export interface ReferralDashboardResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: ReferralDashboardData;
}

export interface ValidateReferralResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: unknown;
}

export interface ValidateReferralParams {
  referralCode: string;
  userType?: string;
}

const REFERRAL_DASHBOARD_QUERY_KEY = ['referralDashboard'] as const;

export const useGetReferralDashboard = () => {
  return useQuery<ReferralDashboardResponse>({
    queryKey: [...REFERRAL_DASHBOARD_QUERY_KEY],
    queryFn: async () => {
      const response = await axiosInstance.get<ReferralDashboardResponse>(
        EndPoints.CUSTOMER_REFERRAL_DASHBOARD,
      );
      return response.data;
    },
  });
};

export const useValidateReferralCode = () => {
  return useMutation<ValidateReferralResponse, Error, ValidateReferralParams>({
    mutationFn: async ({ referralCode, userType = 'customer' }) => {
      const url = `${EndPoints.PUBLIC_VALIDATE_REFERRAL}?referralCode=${encodeURIComponent(referralCode)}&userType=${encodeURIComponent(userType)}`;
      const response = await axiosInstance.get<ValidateReferralResponse>(url);
      return response.data;
    },
  });
};
