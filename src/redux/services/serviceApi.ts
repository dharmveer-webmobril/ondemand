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
  }),
  overrideExisting: false,
});

export const {
  useGetNearByServicesQuery
} = serviceApi;