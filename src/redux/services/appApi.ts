import { ENDPOINTS } from "../../utils";
import { api } from "./api";

export const appApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Submit customer support
    submitCustomerSupport: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: ENDPOINTS.CUSTOMER_SUPPORT,
        method: "POST",
        body: data,
      }),
    }),
    getTermAndCond: builder.query<any, void>({
      query: () => ({
        url: ENDPOINTS.GET_TERMS_CONDITIONS,
        method: "GET",
      }),
    }),
    // Fetch user-specific categories
    getCategories: builder.query<any[], void>({
      query: () => ({
        url: ENDPOINTS.GET_CATEGORIES,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (response?.success && Array.isArray(response?.data)) {
          return response.data.map((category: any) => ({
            label: category.name,
            value: category._id,
            categoryImage: category?.categoryImage,
            category: category,
            subcat: (category.subcategories || []).map((sub: any, index: number) => ({
              label: sub.name,
              value: sub._id,
              subcat: sub,
              index: index,
            })),
          }));
        }
        return [];
      },
    }),
    submitAddress: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: ENDPOINTS.ADD_ADDRESS,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: 'AdressTag' }],
    }),
    getAddress: builder.query<any, void>({
      query: () => ({
        url: ENDPOINTS.GET_ADDRESS,
        method: "GET",
      }),
      providesTags: [{ type: 'AdressTag' }],
    }),

    deleteAddress: builder.mutation<any, { id: string }>({
      query: ({ id }) => {
        return {
          url: `${ENDPOINTS.DELETE_ADDRESS}/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: 'AdressTag' }],
    }),
    updateAddress: builder.mutation<any, { data: any }>({
      query: ({ data }) => {
        return {
          url: ENDPOINTS.UPDATE_ADDRESS,
          method: "POST",
          body: data
        };
      },
      invalidatesTags: [{ type: 'AdressTag' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSubmitCustomerSupportMutation,
  useGetTermAndCondQuery,
  useGetCategoriesQuery,
  useSubmitAddressMutation,
  useGetAddressQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} = appApi;