import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { ApiResponse } from '../index';
import EndPoints from '../EndPoints';
import { Platform } from 'react-native';

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
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axiosInstance.get<any>(EndPoints.GET_CATEGORIES);
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