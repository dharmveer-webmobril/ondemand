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
}

export const useGetServiceProviders = (params: GetServiceProvidersParams = {}) => {
    const { page = 1, limit = 10, categoryIds } = params;
    
    return useQuery<ServiceProvidersResponse>({
        queryKey: ['serviceProviders', page, limit, categoryIds],
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
            
            const response = await axiosInstance.get<ServiceProvidersResponse>(url);
            return response.data;
        },
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