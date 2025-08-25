// src/features/appSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosApi } from '../services/api';
import { ENDPOINTS } from '../../utils';
import { getAppState, RootState } from '../store';
interface AuthState {
    bookingJson?: any;
    otherUserAddress?: any;
}

const initialState: AuthState = {
    bookingJson: null,
    otherUserAddress: null,
};

// Thunk for fetching users
export const getProvidersByCatAndSubcat = createAsyncThunk(
    "service/getShopList",
    async (params: { catId: string; subcatId: string | null }, { rejectWithValue }) => {
        try {
            const token = (getAppState() as RootState).auth.token;
            let url = `${ENDPOINTS.GET_PROVIDER_BY_CAT_SUBCAT}?catId=${params?.catId}`
            if (params.subcatId) {
                url += `&subCat=${params.subcatId}`;
            }
            console.log('urlurl---', url,token);

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
