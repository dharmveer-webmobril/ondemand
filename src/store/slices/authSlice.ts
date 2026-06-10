import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserDetails {
  [key: string]: any;
}

interface AuthState {
  userId: string | null;
  token: string | null;
  cityId: string | null;
  countryId: string | null;
  userDetails: UserDetails | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  biometricEnabled: boolean;
}

const initialState: AuthState = {
  userId: null,
  token: null,
  userDetails: null,
  isAuthenticated: false,
  isGuest: false,
  cityId: null,
  countryId: null,
  biometricEnabled: false,
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
        isGuest?: boolean;
      }>,
    ) => {
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.userDetails = action.payload.userDetails;
      state.isAuthenticated = true;
      state.isGuest =
        action.payload.isGuest === true ||
        action.payload.userDetails?.isGuest === true;
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
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    enableBiometric: (state) => {
      state.biometricEnabled = true;
    },
    disableBiometric: (state) => {
      state.biometricEnabled = false;
    },
    logout: (state) => {
      state.userId = null;
      state.token = null;
      state.userDetails = null;
      state.isAuthenticated = false;
      state.isGuest = false;
      state.cityId = null;
      state.countryId = null;
      state.biometricEnabled = false;
    },
  },
});

export const {
  setCredentials,
  updateUserDetails,
  setToken,
  updateToken,
  enableBiometric,
  disableBiometric,
  logout,
  setCityId,
  setCountryId,
} = authSlice.actions;

export default authSlice.reducer;
