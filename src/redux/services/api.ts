// src/redux/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result: any = await rawBaseQuery(args, api, extraOptions);
  console.log("API Result:", result);

  if (!result?.data?.succeeded && result?.data?.ResponseCode === 401) {
    // TODO: Dispatch logout or navigate
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  endpoints: () => ({}), // will inject endpoints elsewhere
});
