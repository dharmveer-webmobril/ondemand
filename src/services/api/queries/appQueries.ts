import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { ApiResponse } from '../index';
import EndPoints from '../EndPoints';
import { Platform } from 'react-native';

// Category interfaces
export interface Category {
  _id: string;
  name: string;
  image: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CategoriesResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: Category[];
}

// Banner interfaces
export interface Banner {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BannersResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: Banner[];
}

// Service Provider interfaces
export interface City {
  _id: string;
  name: string;
  countryId: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Country {
  _id: string;
  name: string;
  flag: string;
  countryCode: string;
  phoneCode: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BusinessProfile {
  _id: string;
  spId: string;
  description: string;
  address: string;
  bannerImage: string;
  businessProof: string | null;
  portfolioImages: string[];
  websiteAndSocialLinks: {
    website: string | null;
    facebook: string | null;
    instagram: string | null;
    recommendation: string | null;
  };
  amenitiesIds: string[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
  name: string;
}

export interface ServiceProvider {
  _id: string;
  name: string;
  email: string;
  contact: string;
  profileImage: string;
  city: City;
  country: Country;
  coordinates: Coordinates;
  subscription: boolean;
  status: string;
  googleId: string | null;
  applId: string | null;
  oauthProvider: string;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  createdAt: string;
  updatedAt: string;
  tempOTP: string;
  isVerified: boolean;
  rating: number | null;
  /** Present when listing providers with lat/lng (distance from user). */
  distanceKm?: number;
  businessProfile: BusinessProfile;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ServiceProvidersResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: ServiceProvider[];
  pagination: Pagination;
}

export const useGetAppInfo = () => {
  return useQuery({
    queryKey: ['appInfo'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse>('/app/info');
      return response.data;
    },
  });
};

export const useGetCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await axiosInstance.get<any>(EndPoints.GET_COUNTRIES);
      return response.data;
    },
  });
};
export const useGetCities = (countryId: string | null) => {
  // console.log(countryId, 'countryId------');

  return useQuery({
    queryKey: ['cities', countryId],
    queryFn: async () => {
      if (!countryId) throw new Error('Country ID is required');
      const response = await axiosInstance.get<any>(
        `${EndPoints.GET_CITIES}/${countryId}`,
      );
      return response.data;
    },
    enabled: !!countryId, // Only run query if countryId exists
  });
};

export const useGetCategories = () => {
  return useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get<CategoriesResponse>(
        EndPoints.GET_CATEGORIES,
      );
      return response.data;
    },
  });
};

export const useGetBanners = () => {
  return useQuery<BannersResponse>({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await axiosInstance.get<BannersResponse>(
        EndPoints.GET_BANNERS,
      );
      return response.data;
    },
  });
};

export const useGetServiceProviders = (params: any) => {
  const {
    page = 1,
    limit = 10,
    categoryIds,
    search,
    cityName,
    lat,
    lng,
    minRating,
    maxDistance,
    sortBy,
    enabled = true,
  } = params;

  // Normalize query key - use null instead of undefined for consistent caching
  const normalizedCategoryIds =
    categoryIds && categoryIds.length > 0 ? categoryIds : null;
  const normalizedSearch = search && search.trim() ? search.trim() : null;
  const normalizedCityName =
    cityName && String(cityName).trim() ? String(cityName).trim() : null;

  const trimCoord = (v: unknown): string | null => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? s : null;
  };
  const normalizedLat = trimCoord(lat);
  const normalizedLng = trimCoord(lng);
  const hasLatLng = !!(normalizedLat && normalizedLng);

  const normalizedMinRating =
    minRating !== undefined &&
    minRating !== null &&
    minRating !== '' &&
    Number.isFinite(Number(minRating))
      ? Number(minRating)
      : null;
  const normalizedMaxDistance =
    maxDistance !== undefined && maxDistance !== null && maxDistance !== ''
      ? String(maxDistance).trim()
      : null;
  const maxDistNum =
    normalizedMaxDistance != null && normalizedMaxDistance !== ''
      ? Number(normalizedMaxDistance)
      : null;
  const normalizedMaxDistanceKey =
    maxDistNum != null && Number.isFinite(maxDistNum) ? maxDistNum : null;

  const normalizedSortBy =
    sortBy && String(sortBy).trim() ? String(sortBy).trim() : null;

  return useQuery<any>({
    queryKey: [
      'serviceProviders',
      page,
      limit,
      normalizedCategoryIds,
      normalizedSearch,
      normalizedCityName,
      normalizedLat,
      normalizedLng,
      normalizedMinRating,
      normalizedMaxDistanceKey,
      normalizedSortBy,
    ],
    queryFn: async () => {
      // Convert page and limit to strings explicitly
      const pageStr = String(page);
      const limitStr = String(limit);
      let url = `${EndPoints.GET_SERVICE_PROVIDERS}?page=${pageStr}&limit=${limitStr}`;

      // Add categoryIds if provided
      if (categoryIds && categoryIds.length > 0) {
        // Format as JSON array string: ["id1", "id2"]
        const categoryIdsParam = JSON.stringify(categoryIds);
        url += `&categoryIds=${encodeURIComponent(categoryIdsParam)}`;
      }
      // Nearby providers: prefer lat/lng when both are valid (matches `/customer/service-providers?...&lat=&lng=`)
      if (hasLatLng) {
        url += `&lat=${encodeURIComponent(
          normalizedLat!,
        )}&lng=${encodeURIComponent(normalizedLng!)}`;
      } else if (normalizedCityName) {
        url += `&cityName=${encodeURIComponent(normalizedCityName)}`;
      }
      // Add search query if provided
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (normalizedMinRating != null) {
        url += `&minRating=${encodeURIComponent(String(normalizedMinRating))}`;
      }
      if (normalizedMaxDistanceKey != null) {
        url += `&maxDistance=${encodeURIComponent(
          String(normalizedMaxDistanceKey),
        )}`;
      }
      if (normalizedSortBy) {
        url += `&sortBy=${encodeURIComponent(normalizedSortBy)}`;
      }
      console.log('fetch providers url------->', url);
      const response = await axiosInstance.get<any>(url);
      return response.data;
    },
    staleTime: 0, // Data is immediately stale, always refetch
    gcTime: 0, // Don't cache data (React Query v5)
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    enabled,
  });
};

export const useGetTermsAndConditions = () => {
  return useQuery({
    queryKey: ['termsAndConditions'],
    queryFn: async () => {
      const response = await axiosInstance.get<any>(
        EndPoints.GET_TERMS_AND_CONDITIONS,
      );
      return response.data;
    },
  });
};

export interface UploadDocumentData {
  docType: string;
  document: any; // File/Image object
}

export interface UploadDocumentResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    url: string;
    bucket: string;
    fileName: string;
    docType: string;
  };
}

export const useUploadDocument = () => {
  return useMutation<UploadDocumentResponse, Error, UploadDocumentData>({
    mutationFn: async (data: UploadDocumentData) => {
      const formData = new FormData();
      console.log('data-----useUploadDocument', data);
      formData.append('docType', data.docType);
      const image = data.document;
      const fileName =
        image.filename ??
        image.path?.split('/').pop() ??
        `image_${Date.now()}.jpg`;

      const file = {
        uri:
          Platform.OS === 'android'
            ? image.path.startsWith('file://')
              ? image.path
              : `file://${image.path}`
            : image.path,

        type: image.mime ?? 'image/jpeg',

        name: fileName,
      };

      formData.append('document', file as any);
      console.log('formData-----useUploadDocument', formData);
      return (
        await axiosInstance.post<UploadDocumentResponse>(
          EndPoints.UPLOAD_DOCUMENT,
          formData,
        )
      ).data;
    },
  });
};

// Service Provider Detail interfaces
export interface ServiceProviderDetailResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: ServiceProvider;
}

// Service interfaces
export interface ServiceAddOn {
  _id: string;
  sp_id: string;
  serviceId: {
    _id: string;
    sp_id: string;
    category_id: string;
    name: string;
    time: number;
    description: string;
    preferences: string[];
    priceType: string;
    price: number;
    consultationPrice: number | null;
    discountPercentage: number;
    images: string[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  name: string;
  duration: number;
  description: string;
  price: number;
  type: string;
  discountPercentage: number;
  images: string[];
  enum: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Service {
  _id: string;
  sp_id: string;
  category_id: {
    _id: string;
    name: string;
    image: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  name: string;
  time: number; // duration in minutes
  description: string;
  preferences: string[];
  priceType: string; // "fixed" | "hourly" | "2" etc.
  price: number;
  consultationPrice: number | null;
  discountPercentage: number;
  images: string[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  serviceAddOns?: ServiceAddOn[];
}

export interface ServicesResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    services: Service[];
  };
  pagination?: Pagination;
}

// Get Service Provider Detail
export const useGetServiceProviderDetail = (spId: string | null) => {
  console.log(spId, 'spId------');
  return useQuery<any>({
    queryKey: ['serviceProviderDetail', spId],
    queryFn: async () => {
      if (!spId) throw new Error('Service Provider ID is required');
      const response = await axiosInstance.get<any>(
        `${EndPoints.GET_SERVICE_PROVIDER_DETAIL}/${spId}`,
      );
      return response.data;
    },
    enabled: !!spId, // Only run query if spId exists
  });
};

// Get Service Provider Services
export const useGetServiceProviderServices = (
  spId: string | null,
  preference: string | null,
) => {
  return useQuery<any>({
    queryKey: ['serviceProviderServices', spId, preference],
    queryFn: async () => {
      if (!spId) throw new Error('Service Provider ID is required');
      let url = `${EndPoints.GET_SERVICE_PROVIDER_SERVICES}/${spId}/services`;
      if (preference) {
        url += `?preference=${preference}`;
      }

      const response = await axiosInstance.get<any>(url);
      return response.data;
    },
    enabled: !!spId, // Only run query if spId exists
  });
};

// Service Provider Members
export interface SPMemberService {
  _id: string;
  name: string;
}

export interface SPMember {
  _id: string;
  spId: string;
  name: string;
  email?: string;
  contact?: string;
  profileImage?: string | null;
  city?: string | null;
  country?: { _id: string; name: string } | null;
  description?: string;
  services?: SPMemberService[];
  status?: boolean;
  createdAt: string;
  updatedAt?: string;
  coordinates?: unknown;
}

export interface SPMembersResponse {
  ResponseCode?: number;
  ResponseMessage?: string;
  succeeded?: boolean;
  ResponseData?: SPMember[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export const useGetServiceProviderMembers = (
  spId: string | null,
  params: { page: number; limit: number } = { page: 1, limit: 10 },
) => {
  const { page, limit } = params;
  return useQuery<SPMembersResponse>({
    queryKey: ['serviceProviderMembers', spId, page, limit],
    queryFn: async () => {
      if (!spId) throw new Error('Service Provider ID is required');
      const query = new URLSearchParams();
      query.append('page', String(page));
      query.append('limit', String(limit));
      const response = await axiosInstance.get<SPMembersResponse>(
        `${EndPoints.GET_SERVICE_PROVIDER_MEMBERS(spId)}?${query.toString()}`,
      );
      return response.data;
    },
    enabled: !!spId,
  });
};

// Availability interfaces
export interface AvailabilityData {
  date: string;
  startTime: string;
  endTime: string;
  close: boolean;
}

export interface AvailabilityResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    available: boolean;
    availability: AvailabilityData;
  };
}

// Get Service Provider Availability
export const useGetServiceProviderAvailability = (
  spId: string | null,
  date: string | null,
  enabled = true,
) => {
  return useQuery<AvailabilityResponse>({
    queryKey: ['serviceProviderAvailability', spId, date],
    queryFn: async () => {
      if (!spId || !date)
        throw new Error('Service Provider ID and date are required');
      const response = await axiosInstance.get<AvailabilityResponse>(
        `${EndPoints.GET_SERVICE_PROVIDER_AVAILABILITY}/${spId}/availability?date=${date}`,
      );
      return response.data;
    },
    enabled: enabled && !!spId && !!date,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });
};

// Address interfaces
export interface Address {
  _id: string;
  name: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  country: string;
  pincode: string;
  contact: string;
  addressType: 'home' | 'office' | 'other';
  isDefault?: boolean;
}

export interface AddressesResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: Address[];
}

export interface AddAddressRequest {
  name: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  country: string;
  pincode: string;
  contact: string;
  addressType: 'home' | 'office' | 'other';
}

/** POST/PUT `/auth/customer/addresses` — customer saved address body */
export interface CustomerAddressCreateBody {
  name: string;
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  contact: string;
  coordinates: { lat: number; lng: number };
  googlePlaceId: string | null;
  formattedAddress: string;
  cityName: string;
  countryName: string;
  countryIso2: string;
}

// Get Customer Addresses
export const useGetCustomerAddresses = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled !== false;
  return useQuery<AddressesResponse>({
    queryKey: ['customerAddresses'],
    queryFn: async () => {
      const response = await axiosInstance.get<AddressesResponse>(
        EndPoints.GET_CUSTOMER_ADDRESSES,
      );
      return response.data;
    },
    enabled,
  });
};

// Add Customer Address
export const useAddCustomerAddress = () => {
  return useMutation<ApiResponse, Error, CustomerAddressCreateBody>({
    mutationFn: async (data: CustomerAddressCreateBody) => {
      const response = await axiosInstance.post<ApiResponse>(
        EndPoints.ADD_CUSTOMER_ADDRESS,
        data,
      );
      return response.data;
    },
  });
};

// Update Customer Address
export const useUpdateCustomerAddress = () => {
  return useMutation<
    ApiResponse,
    Error,
    { addressId: string; data: CustomerAddressCreateBody }
  >({
    mutationFn: async ({ addressId, data }) => {
      const response = await axiosInstance.put<ApiResponse>(
        `${EndPoints.UPDATE_CUSTOMER_ADDRESS}/${addressId}`,
        data,
      );
      return response.data;
    },
  });
};

// Delete Customer Address
export const useDeleteCustomerAddress = () => {
  return useMutation<ApiResponse, Error, string>({
    mutationFn: async (addressId: string) => {
      const response = await axiosInstance.delete<ApiResponse>(
        `${EndPoints.DELETE_CUSTOMER_ADDRESS}/${addressId}`,
      );
      return response.data;
    },
  });
};
export const useLogout = () => {
  return useMutation<any, Error, void>({
    mutationFn: async () => {
      const response = await axiosInstance.post<ApiResponse>(
        `${EndPoints.LOGOUT}`,
      );
      return response.data;
    },
  });
};

// Booking interfaces
export interface CreateBookingRequest {
  _id?: string;
  spId: string;
  services: Array<{
    serviceId: string;
    addOnIds: string[];
    promotionOfferId: string | null;
  }>;
  bookedFor: 'self' | 'other';
  addressId?: string;
  otherDetails?: {
    name: string;
    email: string;
    contact: string;
    countryCode: string;
  } | null;
  date: string;
  time: string;
  paymentType: string;
  remark?: string;
  preferences: string[];
  /** Sent only for full wallet checkout when the API expects the amount to reserve. */
  walletAmountUsed?: number;
}

export interface CreateBookingResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: {
    _id: string;
    bookingId?: string;
    [key: string]: any;
  };
}

// Create Booking
export const useCreateBooking = () => {
  return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
    mutationFn: async (data: CreateBookingRequest) => {
      const response = await axiosInstance.post<CreateBookingResponse>(
        EndPoints.CREATE_BOOKING,
        data,
      );
      return response.data;
    },
  });
};

export interface CreateRoutineBookingRequest {
  spId: string;
  services: Array<{
    serviceId: string;
    addOnIds: string[];
    promotionOfferId: string | null;
  }>;
  sessions: Array<{ date: string; time: string }>;
  paymentType: string;
  preferences: string[];
  bookedFor: 'self' | 'other';
  addressId?: string;
  remark?: string;
}

export interface CreateRoutineBookingResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: {
    routineBooking?: {
      _id: string;
      routineBookingId?: string;
      paymentStatus?: string;
      routineStatus?: string;
      [key: string]: any;
    };
    sessions?: unknown[];
    amount?: number;
    [key: string]: any;
  };
}

export const useCreateRoutineBooking = () => {
  return useMutation<
    CreateRoutineBookingResponse,
    Error,
    CreateRoutineBookingRequest
  >({
    mutationFn: async (data: CreateRoutineBookingRequest) => {
      const response = await axiosInstance.post<CreateRoutineBookingResponse>(
        EndPoints.CREATE_ROUTINE_BOOKING,
        data,
      );
      return response.data;
    },
  });
};

// Wallet (response: balance, currency, totalCredited, totalUsed, totalSettled)
export interface WalletResponse {
  ResponseCode?: number;
  ResponseMessage?: string;
  succeeded?: boolean;
  ResponseData?: {
    balance?: number;
    amount?: number;
    currency?: string;
    totalCredited?: number;
    totalUsed?: number;
    totalSettled?: number;
    [key: string]: any;
  };
}

export const useGetWallet = () => {
  return useQuery<WalletResponse>({
    queryKey: ['customerWallet'],
    queryFn: async () => {
      const response = await axiosInstance.get<WalletResponse>(
        EndPoints.GET_WALLET,
      );
      return response.data;
    },
  });
};

// Wallet transactions (bookingId can be object with _id, bookingId, totalAmount)
export interface WalletTransaction {
  _id: string;
  transactionId: string;
  amount: number;
  currency?: string;
  status: string;
  paymentGateway?: string;
  paymentType?: string;
  description?: string;
  createdAt: string;
  isRefund?: boolean;
  bookingId?: { _id: string; bookingId: string; totalAmount?: number };
  [key: string]: any;
}

export interface WalletTransactionsResponse {
  ResponseCode?: number;
  ResponseMessage?: string;
  succeeded?: boolean;
  ResponseData?: {
    data?: WalletTransaction[];
    transactions?: WalletTransaction[];
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export type WalletTransactionParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export const useGetWalletTransactions = (params: WalletTransactionParams) => {
    const { page = 1, limit = 10, status } = params;
    return useQuery<WalletTransactionsResponse>({
        queryKey: ['customerWalletTransactions', page, limit, status],
        queryFn: async () => {
            const search = new URLSearchParams();
            if (page) search.append('page', String(page));
            if (limit) search.append('limit', String(limit));
            if (status && status !== 'all') search.append('status', status);
            const queryString = search.toString();
            const url = `${EndPoints.GET_WALLET_TRANSACTIONS}${
                queryString ? `?${queryString}` : ''
            }`;
            const response = await axiosInstance.get<WalletTransactionsResponse>(url);
            return response.data;
        },
    });
};

/** Booking vs add-on payment history (`type=booking` | `type=additional_addon`). */
export type PaymentTransactionType = 'booking' | 'additional_addon';

export type PaymentTransactionsParams = {
    page?: number;
    limit?: number;
    type?: PaymentTransactionType;
};

export const useGetPaymentTransactions = (params: PaymentTransactionsParams) => {
    const { page = 1, limit = 10, type = 'booking' } = params;
    return useQuery<WalletTransactionsResponse>({
        queryKey: ['customerPaymentTransactions', page, limit, type],
        queryFn: async () => {
            const search = new URLSearchParams();
            search.append('page', String(page));
            search.append('limit', String(limit));
            search.append('type', type);
            const url = `${EndPoints.GET_PAYMENT_TRANSACTIONS}?${search.toString()}`;
            const response = await axiosInstance.get<WalletTransactionsResponse>(url);
            return response.data;
        },
    });
};

// Withdraw (wallet settlement) request and list
export interface WithdrawRequestBankDetails {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
}

export interface RequestWalletSettlementPayload {
  amount: number;
  bankDetails: WithdrawRequestBankDetails;
}

export interface WithdrawRequestItem {
  _id: string;
  amount: number;
  currency?: string;
  status: string;
  bankDetails?: WithdrawRequestBankDetails;
  createdAt: string;
  [key: string]: any;
}

export interface SettlementRequestsResponse {
  ResponseCode?: number;
  ResponseMessage?: string;
  succeeded?: boolean;
  ResponseData?: {
    data?: WithdrawRequestItem[];
    requests?: WithdrawRequestItem[];
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export type SettlementRequestsParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export const useGetSettlementRequests = (
  params: SettlementRequestsParams & { enabled?: boolean } = {},
) => {
  const { page = 1, limit = 10, status, enabled = true } = params;
  return useQuery<SettlementRequestsResponse>({
    queryKey: ['customerSettlementRequests', page, limit, status],
    enabled,
    queryFn: async () => {
      const search = new URLSearchParams();
      if (page) search.append('page', String(page));
      if (limit) search.append('limit', String(limit));
      if (status && status !== 'all') search.append('status', status);
      const queryString = search.toString();
      const url = `${EndPoints.GET_SETTLEMENT_REQUESTS}${
        queryString ? `?${queryString}` : ''
      }`;
      const response = await axiosInstance.get<SettlementRequestsResponse>(url);
      return response.data;
    },
  });
};

export const useRequestWalletSettlement = () => {
  return useMutation<any, Error, RequestWalletSettlementPayload>({
    mutationFn: async (data: RequestWalletSettlementPayload) => {
      const response = await axiosInstance.post<any>(
        EndPoints.REQUEST_WALLET_SETTLEMENT,
        data,
      );
      return response.data;
    },
  });
};

// Initiate Booking Payment
export interface InitiateBookingPaymentRequest {
  bookingId?: string;
  routineBookingId?: string;
  amount: number;
  /** Omitted for pure wallet settlement after create (server uses paymentMethod `wallet`). */
  paymentGateway?: 'stripe' | 'paypal' | 'flutterwave';
  /** Mirrors create-booking payment mode: `wallet`, `wallet_partial`, `online`, etc. */
  paymentType?: string;
  paymentMethod: string;
  useWallet: boolean;
  walletAmount?: number;
  platform?: string;
}

export interface InitiateBookingPaymentResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: {
    transaction: {
      _id: string;
      transactionId: string;
      amount: number;
      paymentGateway: string;
      status: string;
      [key: string]: any;
    };
    paymentIntent?: {
      id: string;
      client_secret: string;
      status: string;
      [key: string]: any;
    };
    redirectUrl?: string | null;
    [key: string]: any;
  };
}

export const useInitiateBookingPayment = () => {
  return useMutation<any, Error, InitiateBookingPaymentRequest>({
    mutationFn: async (data: InitiateBookingPaymentRequest) => {
      const response = await axiosInstance.post<any>(
        EndPoints.INITIATE_BOOKING_PAYMENT,
        data,
      );
      return response.data;
    },
  });
};

// Confirm Booking Payment (for wallet_partial send walletTransactionId instead of bookingId)
export interface ConfirmBookingPaymentRequest {
  transactionId?: string;
  bookingId?: string;
  walletTransactionId?: string;
  [key: string]: any;
}

export interface ConfirmBookingPaymentResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: any;
}

export const useConfirmBookingPayment = () => {
  return useMutation<
    ConfirmBookingPaymentResponse,
    Error,
    ConfirmBookingPaymentRequest
  >({
    mutationFn: async (data: ConfirmBookingPaymentRequest) => {
      const response = await axiosInstance.post<ConfirmBookingPaymentResponse>(
        EndPoints.CONFIRM_BOOKING_PAYMENT,
        data,
      );
      return response.data;
    },
  });
};

/** Catalog add-ons available for a service (GET …/bookings/services/:serviceId/add-ons). */
export interface ServiceAddonItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPercentage?: number;
}

export const useGetServiceAddOns = (
  serviceId: string | undefined,
  enabled = true,
) => {
  return useQuery({
    queryKey: ['serviceCatalogAddOns', serviceId],
    queryFn: async () => {
      const response = await axiosInstance.get<{
        succeeded?: boolean;
        ResponseData?: ServiceAddonItem[];
      }>(EndPoints.GET_SERVICE_ADDONS(serviceId as string));
      return response.data;
    },
    enabled: !!serviceId && enabled,
  });
};

export const useAddBookedServiceAdditionalAddon = () => {
  return useMutation<
    any,
    Error,
    { bookedServiceId: string; addonId: string }
  >({
    mutationFn: async ({ bookedServiceId, addonId }) => {
      const response = await axiosInstance.post(
        EndPoints.ADD_BOOKED_SERVICE_ADDITIONAL_ADDON(bookedServiceId),
        { addonId },
      );
      return response.data;
    },
  });
};

export interface InitiateAdditionalAddonPaymentRequest {
  bookedServiceId: string;
  addonId: string;
  amount: number;
  paymentGateway: 'stripe' | 'paypal' | 'flutterwave';
  paymentMethod: string;
  platform: string;
}

export const useInitiateAdditionalAddonPayment = () => {
  return useMutation<any, Error, InitiateAdditionalAddonPaymentRequest>({
    mutationFn: async (data: InitiateAdditionalAddonPaymentRequest) => {
      const response = await axiosInstance.post(
        EndPoints.INITIATE_ADDITIONAL_ADDON_PAYMENT,
        data,
      );
      return response.data;
    },
  });
};

export interface ConfirmAdditionalAddonPaymentRequest {
  transactionId: string;
}

export const useConfirmAdditionalAddonPayment = () => {
  return useMutation<any, Error, ConfirmAdditionalAddonPaymentRequest>({
    mutationFn: async (data: ConfirmAdditionalAddonPaymentRequest) => {
      const response = await axiosInstance.post(
        EndPoints.CONFIRM_ADDITIONAL_ADDON_PAYMENT,
        data,
      );
      return response.data;
    },
  });
};

// Booking interfaces
export interface BookedService {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPercentage: number;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  promotionOfferId?: {
    _id: string;
    discountType: string;
    discountValue: number;
  } | null;
  addOnServices: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
  }>;
  totalAmount: number;
  promotionOfferAmount: number;
  discountedAmount: number;
}

export interface Booking {
  _id: string;
  spId: {
    _id: string;
    name: string;
    email: string;
    contact: string;
    profileImage: string;
  };
  customerId: string;
  addressId?: {
    _id: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    country: string;
    pincode: string;
    name: string;
    addressType: string;
  } | null;
  date: string;
  time: string;
  preferences: string[];
  bookedFor: 'self' | 'other';
  bookedForDetails: {
    name: string;
    email: string;
    contact: string;
  };
  totalAmount: number;
  promotionOfferAmount: number;
  discountedAmount: number;
  paymentType: string;
  paymentStatus: string;
  bookingStatus: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  priceSummary: {
    totalAmount: number;
    promotionOfferAmount: number;
    discountedAmount: number;
  };
  bookedServices: BookedService[];
}

export interface CustomerBookingsResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: Booking[];
  pagination: Pagination;
}

// Get Customer Bookings
export const useGetCustomerBookings = (
  page: number = 1,
  limit: number = 10,
  bookingScope: 'general' | 'routine' = 'general',
) => {
  return useQuery<any>({
    queryKey: ['customerBookings', page, limit, bookingScope],
    queryFn: async () => {
      const response = await axiosInstance.get<any>(
        `${EndPoints.GET_CUSTOMER_BOOKINGS}?page=${page}&limit=${limit}`,//&bookingScope=${bookingScope}
      );
      return response.data;
    },
  });
};

export interface RoutineBookingsListResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    pages?: number;
  };
}

export const useGetRoutineBookings = (page: number = 1, limit: number = 50) => {
  return useQuery<RoutineBookingsListResponse>({
    queryKey: ['routineBookings', page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get<RoutineBookingsListResponse>(
        `${EndPoints.GET_ROUTINE_BOOKINGS}?page=${page}&limit=${limit}`,
      );
      return response.data;
    },
  });
};

export const useGetRoutineBookingDetail = (routineBookingId: string) => {
  return useQuery<any>({
    queryKey: ['routineBookingDetail', routineBookingId],
    queryFn: async () => {
      const response = await axiosInstance.get<any>(
        EndPoints.GET_ROUTINE_BOOKING_DETAIL(routineBookingId),
      );
      return response.data;
    },
    enabled: !!routineBookingId,
  });
};

/** Service item from top-rated / top-offered home API */
export interface FeaturedServiceProvider {
  _id: string;
  name: string;
  email?: string;
  contact?: string;
  profileImage?: string;
  city?: string;
  country?: string;
  status?: string;
}

export interface FeaturedServiceItem {
  _id: string;
  sp_id: string;
  category_id: string;
  name: string;
  time?: number;
  description?: string;
  preferences?: string[];
  priceType?: string;
  price?: number;
  images: string[];
  status?: boolean;
  provider: FeaturedServiceProvider;
  averageRating?: number;
  ratingCount?: number;
  highestDiscount?: number;
  discountPercentage?: number;
  consultationPrice?: number | null;
  offerData?: unknown[];
}

export interface FeaturedServicesListApiResponse {
  ResponseCode?: number;
  ResponseMessage?: string;
  succeeded?: boolean;
  ResponseData?: FeaturedServiceItem[] | { services?: FeaturedServiceItem[]; data?: FeaturedServiceItem[] };
}

/** Normalize GET top-rated / top-offered single-list responses */
export function extractFeaturedServicesArray(
  resp: FeaturedServicesListApiResponse | undefined | null,
): FeaturedServiceItem[] {
  const rd = resp?.ResponseData as any;
  if (Array.isArray(rd)) return rd as FeaturedServiceItem[];
  if (Array.isArray(rd?.services)) return rd.services;
  if (Array.isArray(rd?.data)) return rd.data;
  return [];
}

export type FeaturedServicesSectionParams = {
  cityName: string | null | undefined;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export const useGetTopRatedServices = (params: FeaturedServicesSectionParams) => {
  const { cityName, page = 1, limit = 4, enabled = true } = params;
  const normalizedCityName =
    cityName && String(cityName).trim() ? String(cityName).trim() : '';
  return useQuery<FeaturedServicesListApiResponse>({
    queryKey: ['topRatedServices', normalizedCityName, page, limit],
    queryFn: async () => {
      if (!normalizedCityName) {
        throw new Error('City name is required');
      }
      const url = `${
        EndPoints.GET_TOP_RATED_SERVICES
      }?cityName=${encodeURIComponent(
        normalizedCityName,
      )}&page=${page}&limit=${limit}`;
      const response = await axiosInstance.get<FeaturedServicesListApiResponse>(
        url,
      );
      return response.data;
    },
    enabled: !!normalizedCityName && enabled,
  });
};

export const useGetTopOfferedServices = (params: FeaturedServicesSectionParams) => {
  const { cityName, page = 1, limit = 4, enabled = true } = params;
  const normalizedCityName =
    cityName && String(cityName).trim() ? String(cityName).trim() : '';
  return useQuery<FeaturedServicesListApiResponse>({
    queryKey: ['topOfferedServices', normalizedCityName, page, limit],
    queryFn: async () => {
      if (!normalizedCityName) {
        throw new Error('City name is required');
      }
      const url = `${
        EndPoints.GET_TOP_OFFERED_SERVICES
      }?cityName=${encodeURIComponent(
        normalizedCityName,
      )}&page=${page}&limit=${limit}`;
      const response = await axiosInstance.get<FeaturedServicesListApiResponse>(
        url,
      );
      return response.data;
    },
    enabled: !!normalizedCityName && enabled,
  });
};

export type FeaturedListType = 'topRated' | 'topOffered';

// Get Booking Detail Response
export interface BookingDetailResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    booking: Booking;
    bookedServices: BookedService[];
  };
}

// Get Booking Detail by ID
export const useGetBookingDetail = (bookingId: string | null) => {
 
  return useQuery<any>({
    queryKey: ['bookingDetail', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('Booking ID is required');
      const response = await axiosInstance.get<any>(
        `${EndPoints.GET_BOOKING_DETAIL}/${bookingId}`,
      );
      return response.data;
    },
    enabled: !!bookingId,
  });
};

export type ServiceRatingItem = {
  serviceId: string;
  bookedServiceId: string;
  rating: number;
  review: string;
};

export type SpRatingItem = {
  spId: string;
  bookingId: string;
  rating: number;
  review: string;
};

export type MemberRatingItem = {
  memberId: string;
  bookedServiceId: string;
  rating: number;
  review: string;
};

export type SubmitAllRatingReviewsVariables = {
  /** Mongo `_id` of the booking, used to invalidate the detail query after submit. */
  bookingMongoId: string;
  services?: ServiceRatingItem[];
  sp?: SpRatingItem[];
  members?: MemberRatingItem[];
};

export type RatingReviewSectionResult =
  | { status: 'skipped' }
  | { status: 'success'; data?: any }
  | { status: 'error'; message: string };

export type SubmitAllRatingReviewsResult = {
  service: RatingReviewSectionResult;
  sp: RatingReviewSectionResult;
  member: RatingReviewSectionResult;
};

export const useSubmitAllRatingReviews = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SubmitAllRatingReviewsResult,
    Error,
    SubmitAllRatingReviewsVariables
  >({
    mutationFn: async vars => {
      const result: SubmitAllRatingReviewsResult = {
        service: { status: 'skipped' },
        sp: { status: 'skipped' },
        member: { status: 'skipped' },
      };

      const handleSection = async (
        items: any[] | undefined,
        url: string,
        key: 'service' | 'sp' | 'member',
      ) => {



        if (!items || items.length === 0) return;
         
        try {
          const res = await axiosInstance.post(url, { items });
          if (res.data?.succeeded === false) {
            result[key] = {
              status: 'error',
              message: res.data?.ResponseMessage || 'Request failed',
            };
          } else {
            result[key] = { status: 'success', data: res.data };
          }
        } catch (e: any) {
          result[key] = {
            status: 'error',
            message:
              e?.response?.data?.ResponseMessage ||
              e?.message ||
              'Request failed',
          };
        }
      };

      await Promise.all([
        handleSection(vars.services, EndPoints.SERVICE_RATING_REVIEW, 'service'),
        handleSection(vars.sp, EndPoints.SP_RATING_REVIEW, 'sp'),
        handleSection(vars.members, EndPoints.MEMBER_RATING_REVIEW, 'member'),
      ]);

      return result;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['bookingDetail', vars.bookingMongoId],
      });
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
    },
  });
};

// ----- Rating & Review LIST queries -----------------------------------------

export type RatingReviewCustomerInfo = {
  _id?: string;
  name?: string;
  email?: string;
  profileImage?: string | null;
};

export type RatingReviewListItem = {
  _id: string;
  rating: number;
  review?: { text?: string } | null;
  createdAt?: string;
  updatedAt?: string;
  status?: boolean;
  customerId?: RatingReviewCustomerInfo;
  bookingId?: string;
  bookedServiceId?: string;
  serviceId?: { _id: string; name?: string } | string;
  spId?: { _id: string; name?: string; profileImage?: string | null } | string;
  memberId?: { _id: string; name?: string; profileImage?: string | null } | string;
};

export interface RatingReviewListResponse {
  ResponseCode?: number;
  ResponseMessage?: string;
  succeeded?: boolean;
  ResponseData?: RatingReviewListItem[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

type ListReviewsParams = {
  page?: number;
  limit?: number;
  enabled?: boolean;
};

/** GET reviews for a service (by `serviceId`). */
export const useGetServiceReviews = (
  serviceId: string | null | undefined,
  params: ListReviewsParams = {},
) => {
  const { page = 1, limit = 10, enabled = true } = params;
  return useQuery<RatingReviewListResponse>({
    queryKey: ['serviceReviews', serviceId, page, limit],
    queryFn: async () => {
      if (!serviceId) throw new Error('serviceId is required');
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        serviceId,
      });
      const res = await axiosInstance.get<RatingReviewListResponse>(
        `${EndPoints.SERVICE_RATING_REVIEW}?${qs.toString()}`,
      );
      return res.data;
    },
    enabled: !!serviceId && enabled,
  });
};

/** GET reviews for a service provider (by `spId`). */
export const useGetSpReviews = (
  spId: string | null | undefined,
  params: ListReviewsParams = {},
) => {
  const { page = 1, limit = 10, enabled = true } = params;
  return useQuery<RatingReviewListResponse>({
    queryKey: ['spReviews', spId, page, limit],
    queryFn: async () => {
      if (!spId) throw new Error('spId is required');
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        spId,
      });
      const res = await axiosInstance.get<RatingReviewListResponse>(
        `${EndPoints.SP_RATING_REVIEW}?${qs.toString()}`,
      );
      return res.data;
    },
    enabled: !!spId && enabled,
  });
};

/** GET reviews for a team member (by `memberId`). */
export const useGetMemberReviews = (
  memberId: string | null | undefined,
  params: ListReviewsParams = {},
) => {
  const { page = 1, limit = 10, enabled = true } = params;
  return useQuery<RatingReviewListResponse>({
    queryKey: ['memberReviews', memberId, page, limit],
    queryFn: async () => {
      if (!memberId) throw new Error('memberId is required');
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        memberId,
      });
      const res = await axiosInstance.get<RatingReviewListResponse>(
        `${EndPoints.MEMBER_RATING_REVIEW}?${qs.toString()}`,
      );
      return res.data;
    },
    enabled: !!memberId && enabled,
  });
};

// Cancel Booking Request/Response interfaces
export interface CancelBookingRequest {
  reason: string;
}

export interface CancelBookingResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: any;
}

// Cancel Booking (whole booking or service)
export const useCancelBooking = () => {
  return useMutation<
    CancelBookingResponse,
    Error,
    { bookingId: string; reason: string }
  >({
    mutationFn: async ({ bookingId, reason }) => {
      const response = await axiosInstance.put<CancelBookingResponse>(
        `${EndPoints.CANCEL_BOOKING(bookingId)}`,
        { reason },
      );
      return response.data;
    },
  });
};

// Cancel Service Request/Response interfaces
export interface CancelServiceRequest {
  reason: string;
}

export interface CancelServiceResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: any;
}

// Cancel Service (specific service in booking)
export const useCancelService = () => {
  return useMutation<
    CancelServiceResponse,
    Error,
    { serviceId: string; reason: string }
  >({
    mutationFn: async ({ serviceId, reason }) => {
      const response = await axiosInstance.put<CancelServiceResponse>(
        `${EndPoints.CANCEL_BOOKING_SERVICE(serviceId)}`,
        { reason },
      );
      return response.data;
    },
  });
};

// Reschedule Service Request/Response interfaces
export interface RescheduleServiceRequest {
  date: string;
  time: string;
  reason: string;
}

export interface RescheduleServiceResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData?: any;
}

// Reschedule Service
export const useRescheduleService = () => {
  return useMutation<
    RescheduleServiceResponse,
    Error,
    { serviceId: string; data: RescheduleServiceRequest }
  >({
    mutationFn: async ({ serviceId, data }) => {
      const response = await axiosInstance.put<RescheduleServiceResponse>(
        `${EndPoints.RESCHEDULE_BOOKING_SERVICE(serviceId)}`,
        data,
      );
      return response.data;
    },
  });
};

// Accept Reschedule (booked service id)
export const useAcceptRescheduleService = () => {
  return useMutation<RescheduleServiceResponse, Error, string>({
    mutationFn: async (bookedServiceId: string) => {
      const response = await axiosInstance.put<RescheduleServiceResponse>(
        EndPoints.ACCEPT_RESCHEDULE_BOOKING_SERVICE(bookedServiceId),
      );
      return response.data;
    },
  });
};

// Reject Reschedule (booked service id)
export const useRejectRescheduleService = () => {
  return useMutation<RescheduleServiceResponse, Error, string>({
    mutationFn: async (bookedServiceId: string) => {
      const response = await axiosInstance.put<RescheduleServiceResponse>(
        EndPoints.REJECT_RESCHEDULE_BOOKING_SERVICE(bookedServiceId),
      );
      return response.data;
    },
  });
};

export interface BookedServiceTrackingLinkResponse {
  ResponseCode: number;
  ResponseMessage: string;
  succeeded: boolean;
  ResponseData: {
    bookedServiceId: string;
    trackingToken: string;
  };
}

export const useGetBookedServiceTrackingLink = () => {
  return useMutation<BookedServiceTrackingLinkResponse, Error, string>({
    mutationFn: async (bookedServiceId: string) => {
      const response =
        await axiosInstance.get<BookedServiceTrackingLinkResponse>(
          EndPoints.GET_BOOKED_SERVICE_TRACKING_LINK(bookedServiceId),
        );
      return response.data;
    },
  });
};

export {
  type NotificationItem,
  type NotificationsListResponse,
  type NotificationsParams,
  type NotificationsUnreadCountResponse,
  markAllNotificationsRead,
  parseNotificationsUnreadCount,
  useGetNotifications,
  useGetNotificationsUnreadCount,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from './notificationQueries';

export const useCustomerSupport = () => {
  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post<any>(
        EndPoints.CUSTOMER_SUPPORT,
        data,
      );
      return response.data;
    },
    onError: (error: any) => {
      console.log('❌ Support Error Message:', error.message);
      console.log('❌ Status Code:', error.response?.status);
      console.log('❌ API Response:', error.response?.data);
    },
  });
};

/**
 * Normalize GET /customer/favorite-sp.
 * Supports: favorite rows `{ _id, customerId, spId: { ...provider } }`, flat SP arrays, common wrappers.
 */
export function mapFavoriteListResponse(apiBody: any): ServiceProvider[] {
  const rows: any[] | null = Array.isArray(apiBody)
    ? apiBody
    : Array.isArray(apiBody?.ResponseData)
    ? apiBody.ResponseData
    : Array.isArray(apiBody?.data)
    ? apiBody.data
    : Array.isArray(apiBody?.results)
    ? apiBody.results
    : null;
  if (!rows?.length) return [];

  const unwrap = (item: any): ServiceProvider | null => {
    if (!item) return null;
    // Populated favorite row: spId is the service provider document
    if (item.spId != null && typeof item.spId === 'object' && item.spId._id) {
      return item.spId as ServiceProvider;
    }
    if (item.serviceProvider) return item.serviceProvider as ServiceProvider;
    if (item.sp) return item.sp as ServiceProvider;
    if (item.provider) return item.provider as ServiceProvider;
    // Already a service provider object
    if (
      item._id &&
      (item.name != null || item.profileImage != null || item.contact != null)
    ) {
      return item as ServiceProvider;
    }
    return null;
  };

  return rows.map(unwrap).filter(Boolean) as ServiceProvider[];
}

export const useGetFavoriteServiceProviders = () => {
  return useQuery<ServiceProvider[]>({
    queryKey: ['favoriteServiceProviders'],
    queryFn: async () => {
      const response = await axiosInstance.get<any>(EndPoints.FAVORITE_SP);
      return mapFavoriteListResponse(response.data);
    },
  });
};

export const useAddFavoriteServiceProvider = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (spId: string) => {
      const response = await axiosInstance.post(
        EndPoints.FAVORITE_SP_BY_ID(spId),
        {},
      );
      return response.data;
    },
    onSuccess: (_data, spId) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteServiceProviders'] });
      queryClient.invalidateQueries({
        queryKey: ['serviceProviderDetail', spId],
      });
    },
  });
};

export const useRemoveFavoriteServiceProvider = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (spId: string) => {
      const response = await axiosInstance.delete(
        EndPoints.FAVORITE_SP_BY_ID(spId),
      );
      return response.data;
    },
    onSuccess: (_data, spId) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteServiceProviders'] });
      queryClient.invalidateQueries({
        queryKey: ['serviceProviderDetail', spId],
      });
    },
  });
};
