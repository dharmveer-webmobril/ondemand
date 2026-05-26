import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import EndPoints from '../EndPoints';
import { queryClient } from '../queryClient';

export interface NotificationItem {
  _id: string;
  receiverId: string;
  serviceId: { _id: string; name: string } | null;
  bookingId: string | null;
  conversationId: string | null;
  title: string;
  description: string;
  flag: string;
  image: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    notifications: NotificationItem[];
  };
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface NotificationsParams {
  page?: number;
  limit?: number;
}

export interface NotificationsUnreadCountResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData:
    | number
    | {
        unreadCount?: number;
        count?: number;
        unread?: number;
      };
}

type NotificationApiResponse = {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
};

export interface CustomerNotificationSettingsResponse {
  ResponseCode?: number;
  ResponseMessage?: string;
  succeeded?: boolean;
  ResponseData?: {
    enabled?: boolean;
    pushEnabled?: boolean;
    notificationEnabled?: boolean;
    emailEnabled?: boolean;
    pushSettings?: Record<string, unknown>;
    emailSettings?: Record<string, unknown>;
    notification?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
  enabled?: boolean;
  pushEnabled?: boolean;
  notificationEnabled?: boolean;
  emailEnabled?: boolean;
}

const firstDefined = (candidates: unknown[], keys: string[]) => {
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    for (const key of keys) {
      const value = (candidate as Record<string, unknown>)[key];
      if (value !== undefined) return value;
    }
  }
  return undefined;
};

export function extractCustomerNotificationEnabled(
  data: CustomerNotificationSettingsResponse | undefined,
): boolean {
  const responseData = data?.ResponseData as any;
  const value = firstDefined(
    [
      responseData,
      responseData?.pushSettings,
      responseData?.notification,
      responseData?.data,
      data,
    ],
    ['enabled', 'pushEnabled', 'notificationEnabled'],
  );
  return Boolean(value ?? false);
}

export function extractCustomerEmailEnabled(
  data: CustomerNotificationSettingsResponse | undefined,
): boolean {
  const responseData = data?.ResponseData as any;
  const value = firstDefined(
    [
      responseData,
      responseData?.emailSettings,
      responseData?.email,
      responseData?.data,
      data,
    ],
    ['emailEnabled', 'enabled'],
  );
  return Boolean(value ?? false);
}

export const CUSTOMER_NOTIFICATION_SETTINGS_QUERY_KEY = [
  'customerNotificationSettings',
] as const;

/** Mark all customer notifications read — no request body. */
export const markAllNotificationsRead = async (): Promise<NotificationApiResponse> => {
  const response = await axiosInstance.put<NotificationApiResponse>(
    EndPoints.MARK_ALL_NOTIFICATIONS_READ,
  );
  return response.data;
};

export const parseNotificationsUnreadCount = (
  data: NotificationsUnreadCountResponse | undefined,
): number => {
  const rd = data?.ResponseData;
  if (typeof rd === 'number' && Number.isFinite(rd)) return Math.max(0, rd);
  if (rd && typeof rd === 'object') {
    const n = rd.unreadCount ?? rd.count ?? rd.unread ?? 0;
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
};

export const useGetNotifications = (params: NotificationsParams) => {
  const { page = 1, limit = 10 } = params;
  return useQuery<NotificationsListResponse>({
    queryKey: ['customerNotifications', page, limit],
    queryFn: async () => {
      const search = new URLSearchParams();
      search.append('page', String(page));
      search.append('limit', String(limit));
      const url = `${EndPoints.GET_NOTIFICATIONS}?${search.toString()}`;
      const response = await axiosInstance.get<NotificationsListResponse>(url);
      return response.data;
    },
  });
};

export const useGetCustomerNotificationSettings = () => {
  return useQuery<CustomerNotificationSettingsResponse>({
    queryKey: [...CUSTOMER_NOTIFICATION_SETTINGS_QUERY_KEY],
    queryFn: async () => {
      const response = await axiosInstance.get<CustomerNotificationSettingsResponse>(
        EndPoints.CUSTOMER_NOTIFICATION_SETTINGS,
      );
      return response.data;
    },
  });
};

export const useUpdateCustomerNotificationSettings = () => {
  return useMutation<
    CustomerNotificationSettingsResponse,
    Error,
    { enabled: boolean }
  >({
    mutationFn: async ({ enabled }) => {
      const response = await axiosInstance.put<CustomerNotificationSettingsResponse>(
        EndPoints.CUSTOMER_NOTIFICATION_SETTINGS,
        { enabled },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_NOTIFICATION_SETTINGS_QUERY_KEY],
      });
    },
  });
};

export const NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY = [
  'customerNotificationsUnreadCount',
] as const;

export const refreshNotificationsUnreadCount = (): void => {
  queryClient.invalidateQueries({
    queryKey: [...NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY],
  });
};

export const useGetNotificationsUnreadCount = (enabled = true) => {
  return useQuery<NotificationsUnreadCountResponse>({
    queryKey: [...NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY],
    queryFn: async () => {
      const response = await axiosInstance.get<NotificationsUnreadCountResponse>(
        EndPoints.GET_NOTIFICATIONS_UNREAD_COUNT,
      );
      return response.data;
    },
    enabled,
  });
};

export const useMarkAllNotificationsRead = () => {
  return useMutation<NotificationApiResponse, Error>({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      refreshNotificationsUnreadCount();
    },
  });
};

export const useDeleteNotification = () => {
  return useMutation<NotificationApiResponse, Error, string>({
    mutationFn: async (notificationId: string) => {
      const response = await axiosInstance.delete<NotificationApiResponse>(
        EndPoints.DELETE_NOTIFICATION(notificationId),
      );
      return response.data;
    },
  });
};

export const useClearAllNotifications = () => {
  return useMutation<NotificationApiResponse, Error, void>({
    mutationFn: async () => {
      const response = await axiosInstance.delete<NotificationApiResponse>(
        EndPoints.CLEAR_NOTIFICATIONS,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData([...NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY], {
        succeeded: true,
        ResponseData: { unreadCount: 0, count: 0 },
      });
      queryClient.invalidateQueries({ queryKey: ['customerNotifications'] });
      refreshNotificationsUnreadCount();
    },
  });
};
