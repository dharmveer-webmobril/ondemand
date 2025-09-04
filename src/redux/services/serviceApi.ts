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
    getProviderCatSubcat: builder.query<any, { catId: string; subCat?: string | null }>({
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
        console.log('providerIdproviderIdproviderId', providerId);
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
        if (memberId) {
          url = `${url}?memberId=${memberId}`
        }
        console.log('memberIdmemberId-', memberId);
        console.log('urlurlurl-', url);

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
    getSpecialOffers: builder.query<any, void>({
      query: () => {
        let url = ENDPOINTS.GET_SEPECIAL_OFFER;
        return {
          url,
          method: "GET",
        };
      },
    }),

    addRatingReviewForService: builder.mutation<any, { formData: any, bookingId: string }>({
      query: ({ formData, bookingId }) => ({
        url: `${ENDPOINTS.ADD_SERVICE_RATING}/${bookingId}`,
        method: "POST",
        body: formData,
      }),
    }),
    addRatingReviewForProvider: builder.mutation<any, { data: any }>({
      query: ({ data }) => ({
        url: ENDPOINTS.ADD_PROVIDER_RATING,
        method: "POST",
        body: data,
      }),
    }),

    getRatingForService: builder.query<any, { bookingId: string }>({
      query: ({ bookingId }) => {
        let url = `${ENDPOINTS.GET_RATING_FOR_SERVICE}/${bookingId}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getRatingForProvider: builder.query<any, { bookingId: string }>({
      query: ({ bookingId }) => {
        let url = `${ENDPOINTS.GET_RATING_FOR_PROVIDER}/${bookingId}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getProviderPortfolio: builder.query<any, { providerId: string }>({
      query: ({ providerId }) => {
        let url = `${ENDPOINTS.GET_PROVIDER_PORTFOLIO}?providerId=${providerId}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getProviderServices: builder.query<any, { providerId: string }>({
      query: ({ providerId }) => {
        let url = `${ENDPOINTS.GET_PROVIDER_SERVICES}/${providerId}`;
        return {
          url,
          method: "GET",
        };
      },
    }),
    getAllProviderRatings: builder.query<any, { providerId: string }>({
      query: ({ providerId }) => {
        let url = `${ENDPOINTS.GET_ALL_RATING_PROVIDER}/${providerId}`;
        return {
          url,
          method: "GET",
        };
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
  useGetProviderMemberQuery,
  useGetSpecialOffersQuery,
  useAddRatingReviewForServiceMutation,
  useAddRatingReviewForProviderMutation,
  useGetRatingForProviderQuery,
  useGetRatingForServiceQuery,
  useGetProviderPortfolioQuery,
  useGetProviderServicesQuery,
  useGetAllProviderRatingsQuery
} = serviceApi;