import { get } from "@react-native-firebase/database";
import { ENDPOINTS } from "../../utils";
import { api } from "./api";

export const serviceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNearByServices: builder.query<any, void>({
      query: () => ({
        url: `${ENDPOINTS.GET_PROVIDER_NEAR_ME}?page=1&limit=200`,
        method: "GET",
      }),
    }),
    getProviderCatSubcat: builder.query<any[], { catId: string; subCat?: string | null }>({
      query: ({ catId, subCat }) => {
        console.log('catId-', catId, 'subcatid-', subCat);

        let url = `${ENDPOINTS.GET_PROVIDER_BY_CAT_SUBCAT}?catId=${catId}`;
        if (subCat) {
          url += `&subCat=${subCat}`;
        }

        console.log('urlurl', url);

        return {
          url,
          method: "GET",
        };
      },
    }),

    // getServiceSlots: builder.query<any, { serviceId: string; date: string }>({
    //   query: ({ serviceId, date }) => ({
    //     url: `${ENDPOINTS.GET_SERVICES_SLOTS}${serviceId}/slots?date=${date}`,
    //     method: "GET",
    //   }),
    // }),
    getProviderMember: builder.query<any, { providerId: any }>({
      query: ({ providerId }) => {
        console.log('providerIdproviderIdproviderId',providerId);
        
        let url = `${ENDPOINTS.GET_PROVIDER_MEMBER}`;
        if (providerId) {
          url = `${url}?providerId=${providerId}`
        }
        return {
          url,
          method: "GET",
        };
      },
    }),
    getMemberSlots: builder.query<any, { memberId: any }>({
      query: ({ memberId }) => {
        let url = `${ENDPOINTS.GET_MEMBER_SLOTS}`;
        if (memberId)`${url}?memberId=${memberId}`
        return {
          url,
          method: "GET",
        };
      },
    }),
    getServiceSlots: builder.query<any[], { serviceId: string; date: string }>({
      query: ({ serviceId, date }) => {
        let url = `${ENDPOINTS.GET_SERVICES_SLOTS}${serviceId}/slots?date=${date}`;
        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // ensure we always return an array
        return Array.isArray(response?.data) ? response.data : [];
      },
      transformErrorResponse: () => {
        // return empty array in case of error
        return [];
      },
    }),
    submitOtherUserAddress: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: ENDPOINTS.OTHER_USER_BIO,
        method: "POST",
        body: data,
      }),
    }),
    createBooking: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: ENDPOINTS.CREATE_BOOKING,
        method: "POST",
        body: data,
      }),
    }),
    checkoutBooking: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: ENDPOINTS.CHECKOUT_BOOKING,
        method: "POST",
        body: data,
      }),
    }),
    getUserBookingsByTab: builder.query<any[], { tab: string }>({
      query: ({ tab }) => {
        let url = `${ENDPOINTS.GET_USER_BOOKING_BY_TAB}?tab=${tab}`;
        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        // ensure we always return an array
        return Array.isArray(response?.data) ? response.data : [];
      },
      transformErrorResponse: () => {
        // return empty array in case of error
        return [];
      },
    }),


  }),

  overrideExisting: false,
});

export const {
  useGetNearByServicesQuery,
  useGetProviderCatSubcatQuery,
  useGetServiceSlotsQuery,
  useSubmitOtherUserAddressMutation,
  useCreateBookingMutation,
  useCheckoutBookingMutation,
  useGetUserBookingsByTabQuery,
  useGetMemberSlotsQuery,
  useGetProviderMemberQuery
} = serviceApi;