// src/features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface AuthState {
    user: any | null;
    isUserActiveOrNotModal: boolean;
    inactiveMessage: string;
}

const initialState: AuthState = {
    user: null,
    isUserActiveOrNotModal: false,
    inactiveMessage: '',
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
    },
});

export const { setUserActiveOrNotModal, setInactiveMessage } = appSlice.actions;
export default appSlice.reducer;
