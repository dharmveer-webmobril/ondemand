import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserDetails {
  // Add your user details structure here
  [key: string]: any;
}

interface AuthState {
  userId: string | null;
  token: string | null;
  cityId: string | null;
  countryId: string | null;
  userDetails: UserDetails | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  userId: null,
  token: null,
  userDetails: null,
  isAuthenticated: false,
  cityId: null,
  countryId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        userId: string;
        token: string;
        userDetails: UserDetails;
      }>
    ) => {
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.userDetails = action.payload.userDetails;
      state.isAuthenticated = true;
    },
    setCityId: (state, action: PayloadAction<string>) => {
      state.cityId = action.payload;
    },
    setCountryId: (state, action: PayloadAction<string>) => {
      state.countryId = action.payload;
    },
    updateUserDetails: (state, action: PayloadAction<UserDetails>) => {
      state.userDetails = { ...state.userDetails, ...action.payload };
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.userId = null;
      state.token = null;
      state.userDetails = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateUserDetails, updateToken, logout, setCityId, setCountryId } =
  authSlice.actions;
export default authSlice.reducer;
