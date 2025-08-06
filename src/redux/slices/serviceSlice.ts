// src/features/appSlice.ts
import { createSlice } from '@reduxjs/toolkit';
interface AuthState {

}

const initialState: AuthState = {

};

const serviceSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

    },
});

export const { } = serviceSlice.actions;
export default serviceSlice.reducer;
