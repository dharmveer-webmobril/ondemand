import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { setInactiveMessage, setUserActiveOrNotModal } from "../slices/appSlice";
import axios from 'axios'
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

  const isLoginEndpoint =
    typeof args === "string"
      ? args.includes("/auth/login")
      : typeof args === "object" && typeof args.url === "string"
        ? args.url.includes("/auth/login")
        : false;

  const responseCode =
    result?.data?.responseCode ?? result?.error?.data?.responseCode;

  const message =
    result?.data?.message ??
    result?.error?.data?.message ??
    "Something went wrong. Please try again later.";
  console.log('argsargsargs', args);

  // Handle 401 (Unauthorized) or 403 (Forbidden), but NOT for login API
  if (!isLoginEndpoint && (responseCode === 401 || responseCode === 403)) {
    api.dispatch(setInactiveMessage({ message }));
    api.dispatch(setUserActiveOrNotModal({ status: true }));
  }

  return result;
};
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ['ServiceList', 'AdressTag'],
  endpoints: () => ({}), // endpoints injected later
});


export const axiosApi = axios.create({
  baseURL: process.env.API_URL, // your API base
  headers: {
    "Content-Type": "application/json",
  },
});





// import { createApi } from "@reduxjs/toolkit/query/react";
// import { RootState } from "../store";
// import { setInactiveMessage, setUserActiveOrNotModal } from "../slices/appSlice";
// import axios, { AxiosError, AxiosRequestConfig } from "axios";

// // Create axios instance
// export const axiosApi = axios.create({
//   baseURL: process.env.API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 8000, // ⏱️ timeout 8s
// });

// // Custom baseQuery using axios
// const axiosBaseQuery =
//   (): any =>
//   async (args: { url: string; method: AxiosRequestConfig["method"]; data?: any; params?: any }, api :any) => {
//     try {
//       // Get token from state
//       const token = (api.getState() as RootState).auth.token;
//       if (token) {
//         axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       }

//       const result = await axiosApi({
//         url: args.url,
//         method: args.method,
//         data: args.data,
//         params: args.params,
//       });

//       return { data: result.data };
//     } catch (err) {
//       const error = err as AxiosError<any>;
//       const responseCode = error.response?.status ?? error.code;
      
//       const message = error.response?.data?.message ?? error.message ?? "Something went wrong. Please try again later.";

//       const isLoginEndpoint = args.url.includes("/auth/login");

//       // Handle 401/403 globally except login
//       if (!isLoginEndpoint && (responseCode === 401 || responseCode === 403)) {
//         api.dispatch(setInactiveMessage({ message }));
//         api.dispatch(setUserActiveOrNotModal({ status: true }));
//       }

//       return {
//         error: {
//           status: responseCode,
//           data: error.response?.data || message,
//         },
//       };
//     }
//   };

// export const api = createApi({
//   reducerPath: "api",
//   baseQuery: axiosBaseQuery(),
//   tagTypes: ["ServiceList", "AdressTag"],
//   endpoints: () => ({}), // inject endpoints later
// });
