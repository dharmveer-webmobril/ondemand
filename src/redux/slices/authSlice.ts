// src/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StorageProvider } from '../../utils';
interface AuthState {
  user: any | null;
  token: string | null;
  signupToken: string | null;
  isInternetConected: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  signupToken: null,
  isInternetConected: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    setUserProfileData:(state, action: PayloadAction<{ user: any }>)=>{
      state.user=action.payload
    },
    setSignupData: (state, action: PayloadAction<{ token: string }>) => {
      state.signupToken = action.payload.token;
    },
    setInternetConnection: (
      state,
      action: PayloadAction<{ status: boolean }>,
    ) => {
      state.isInternetConected = action.payload.status;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      StorageProvider.removeItem('token');
    },
  },
});

export const { setToken, logout, setSignupData,setUserProfileData } = authSlice.actions;
export default authSlice.reducer;
