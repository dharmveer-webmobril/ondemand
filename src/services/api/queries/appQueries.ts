import { useMutation, useQuery } from '@tanstack/react-query';
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
            const response = await axiosInstance.get<any>(`${EndPoints.GET_CITIES}/${countryId}`);
            return response.data;
        },
        enabled: !!countryId, // Only run query if countryId exists
    });
};

export const useGetCategories = () => {
    return useQuery<CategoriesResponse>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axiosInstance.get<CategoriesResponse>(EndPoints.GET_CATEGORIES);
            return response.data;
        },
    });
};

export const useGetBanners = () => {
    return useQuery<BannersResponse>({
        queryKey: ['banners'],
        queryFn: async () => {
            const response = await axiosInstance.get<BannersResponse>(EndPoints.GET_BANNERS);
            return response.data;
        },
    });
};

export interface GetServiceProvidersParams {
    page?: number;
    limit?: number;
    categoryIds?: string[];
    search?: string;
}

export const useGetServiceProviders = (params: any) => {
    const { page = 1, limit = 10, categoryIds, search, currentCityId } = params;

    // Normalize query key - use null instead of undefined for consistent caching
    const normalizedCategoryIds = categoryIds && categoryIds.length > 0 ? categoryIds : null;
    const normalizedSearch = search && search.trim() ? search.trim() : null;

    return useQuery<ServiceProvidersResponse>({
        queryKey: ['serviceProviders', page, limit, normalizedCategoryIds, normalizedSearch, currentCityId],
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
            if (currentCityId) {
                url += `&cityId=${currentCityId}`;
            }
            // Add search query if provided
            if (search && search.trim()) {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }

            console.log('Fetching providers with URL:', url);
            const response = await axiosInstance.get<ServiceProvidersResponse>(url);
            console.log('Providers response:', response.data);
            return response.data;
        },
        staleTime: 0, // Data is immediately stale, always refetch
        gcTime: 0, // Don't cache data (React Query v5)
        refetchOnMount: 'always', // Always refetch when component mounts
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: false, // Don't refetch on reconnect
    });
};

export const useGetTermsAndConditions = () => {
    return useQuery({
        queryKey: ['termsAndConditions'],
        queryFn: async () => {
            const response = await axiosInstance.get<any>(EndPoints.GET_TERMS_AND_CONDITIONS);
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
                uri: Platform.OS === 'android'
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
                    formData
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
                `${EndPoints.GET_SERVICE_PROVIDER_DETAIL}/${spId}`
            );
            return response.data;
        },
        enabled: !!spId, // Only run query if spId exists
    });
};

// Get Service Provider Services
export const useGetServiceProviderServices = (spId: string | null, preference: string | null) => {
    return useQuery<any>({
        queryKey: ['serviceProviderServices', spId, preference],
        queryFn: async () => {
            if (!spId) throw new Error('Service Provider ID is required');
            let url = `${EndPoints.GET_SERVICE_PROVIDER_SERVICES}/${spId}/services`;
            if (preference) {
                url += `?preference=${preference}`;
            }
            console.log('url--------useGetServiceProviderServices', url);
            const response = await axiosInstance.get<any>(
                url
            );
            return response.data;
        },
        enabled: !!spId, // Only run query if spId exists
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
export const useGetServiceProviderAvailability = (spId: string | null, date: string | null) => {
    return useQuery<AvailabilityResponse>({
        queryKey: ['serviceProviderAvailability', spId, date],
        queryFn: async () => {
            if (!spId || !date) throw new Error('Service Provider ID and date are required');
            const response = await axiosInstance.get<AvailabilityResponse>(
                `${EndPoints.GET_SERVICE_PROVIDER_AVAILABILITY}/${spId}/availability?date=${date}`
            );
            return response.data;
        },
        enabled: !!spId && !!date, // Only run query if spId and date exist
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

// Get Customer Addresses
export const useGetCustomerAddresses = () => {
    return useQuery<AddressesResponse>({
        queryKey: ['customerAddresses'],
        queryFn: async () => {
            const response = await axiosInstance.get<AddressesResponse>(
                EndPoints.GET_CUSTOMER_ADDRESSES
            );
            return response.data;
        },
    });
};

// Add Customer Address
export const useAddCustomerAddress = () => {
    return useMutation<ApiResponse, Error, any>({
        mutationFn: async (data: any) => {
            const response = await axiosInstance.post<ApiResponse>(
                EndPoints.ADD_CUSTOMER_ADDRESS,
                data
            );
            return response.data;
        },
    });
};

// Update Customer Address
export const useUpdateCustomerAddress = () => {
    return useMutation<ApiResponse, Error, { addressId: string; data: any }>({
        mutationFn: async ({ addressId, data }) => {
            console.log('data------useUpdateCustomerAddress', data);
            const response = await axiosInstance.put<ApiResponse>(
                `${EndPoints.UPDATE_CUSTOMER_ADDRESS}/${addressId}`,
                data
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
                `${EndPoints.DELETE_CUSTOMER_ADDRESS}/${addressId}`
            );
            return response.data;
        },
    });
};

// Booking interfaces
export interface CreateBookingRequest {
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
                data
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
export const useGetCustomerBookings = (page: number = 1, limit: number = 10) => {
    return useQuery<CustomerBookingsResponse>({
        queryKey: ['customerBookings', page, limit],
        queryFn: async () => {
            const response = await axiosInstance.get<CustomerBookingsResponse>(
                `${EndPoints.GET_CUSTOMER_BOOKINGS}?page=${page}&limit=${limit}`
            );
            return response.data;
        },
    });
};

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
                `${EndPoints.GET_BOOKING_DETAIL}/${bookingId}`
            );
            return response.data;
        },
        enabled: !!bookingId,
    });
};