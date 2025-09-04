// src/features/appSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosApi } from '../services/api';
import { ENDPOINTS } from '../../utils';
import { getAppState, RootState } from '../store';
import axios, { AxiosError } from 'axios';
interface AuthState {
    bookingJson?: any;
    otherUserAddress?: any;
}

const initialState: AuthState = {
    bookingJson: null,
    otherUserAddress: null,
};

// Thunk for fetching users
export const getProvidersByCatAndSubcat12 = createAsyncThunk(
    "service/getShopList",
    async (params: { catId: string; subcatId: string | null }, { rejectWithValue }) => {
        try {
            const token = (getAppState() as RootState).auth.token;
            let url = `${ENDPOINTS.GET_PROVIDER_BY_CAT_SUBCAT}?catId=${params?.catId}`
            if (params.subcatId) {
                url += `&subCat=${params.subcatId}`;
            }
            console.log('urlurl---', url, token);
            const response = await axiosApi.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ add token here
                },
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Something went wrong");
        }
    }
);

export const getProvidersByCatAndSubcat = createAsyncThunk<any, { catId: any, subcatId: any }, { rejectValue: string }>(
    'service/getShopList',
    async ({ catId, subcatId }, { rejectWithValue }) => {
        try {
            const token = (getAppState() as RootState).auth.token;
            console.log('tokentoken', token, 'type', 'subcatId', subcatId, 'catId', catId);

            let enfPoint = `${ENDPOINTS.GET_PROVIDER_BY_CAT_SUBCAT}?catId=${catId}`
            if (subcatId) {
                enfPoint += `&subCat=${subcatId}`;
            }

            const response = await axios.get(enfPoint, {
                baseURL: process.env.API_URL,
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ add token here
                },
            });

            console.log(`getProvidersByCatAndSubcat API called for cat: ${catId} and subcat= ${subcatId}`, response.data);
            return {  data: response.data };
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`getProvidersByCatAndSubcat error for type:`, axiosError.message);
            return rejectWithValue(axiosError.message);
        }
    }
);

export const getSpecialOffers = createAsyncThunk<
  any,               // return type
  void,              // no argument
  { rejectValue: string }
>('service/getSpecialOffers',async (_, { rejectWithValue }) => {
    try {
      const token = (getAppState() as RootState).auth.token;

      const response = await axios.get(ENDPOINTS.GET_SEPECIAL_OFFER, {
        baseURL: process.env.API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('getSpecialOffers API called', response.data);
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('getSpecialOffers error:', axiosError.message);
      return rejectWithValue(axiosError.message);
    }
  }
);

export const fetchBookings = createAsyncThunk<any, { type: any }, { rejectValue: string }>(
    'service/fetchBookings',
    async ({ type }, { rejectWithValue }) => {
        try {
            const token = (getAppState() as RootState).auth.token;
            console.log('tokentoken', token, 'type', type);

            const response = await axios.get(`${ENDPOINTS.GET_USER_BOOKING_BY_TAB}?tab=${type}`, {
                baseURL: process.env.API_URL,
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ add token here
                },
            });

            console.log(`fetchBookings API called for type: ${type}`, response.data);

            return { type, data: response.data };
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`fetchBookings error for type: ${type}`, axiosError.message);
            return rejectWithValue(axiosError.message);
        }
    }
);


const serviceSlice = createSlice({
    name: 'service',
    initialState,
    reducers: {
        setBookingJson: (state, action) => {
            state.bookingJson = action.payload;
        },
        clearBookingJson: (state) => {
            state.bookingJson = null;
        },
        setOtherUserAddress: (state, action) => {
            state.otherUserAddress = action.payload;
        },
        clearOtherUserAddress: (state) => {
            state.otherUserAddress = null;
        }
    },
});

export const { setBookingJson, clearBookingJson, setOtherUserAddress, clearOtherUserAddress } = serviceSlice.actions;
export default serviceSlice.reducer;
