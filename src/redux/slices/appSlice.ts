// src/features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface AuthState {
    user: any | null;
    isUserActiveOrNotModal: boolean;
    inactiveMessage: string;
    homeAddress: any;
    userCurrentLoc: {
        latitude: number | string
        longitude: number | string
    } | null
}

const initialState: AuthState = {
    user: null,
    isUserActiveOrNotModal: false,
    inactiveMessage: '',
    homeAddress: {},
    userCurrentLoc: null,
};

const appSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserActiveOrNotModal: (state, action: PayloadAction<{ status: boolean }>) => {
            state.isUserActiveOrNotModal = action.payload.status;
        },
        setInactiveMessage: (state, action: PayloadAction<{ message: string }>) => {
            state.inactiveMessage = action.payload.message;
        },
        setHomeAddress: (state, action: PayloadAction<{ address: any }>) => {
            state.homeAddress = action.payload.address
        },
        setUserCurrentLoc: (state, action: PayloadAction<{
            location: {
                latitude: number | string
                longitude: number | string
            } | null
        }>) => {
            state.userCurrentLoc = action.payload.location
        },
    },
});

export const { setUserActiveOrNotModal, setInactiveMessage, setHomeAddress ,setUserCurrentLoc} = appSlice.actions;
export default appSlice.reducer;
