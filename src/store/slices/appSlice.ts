import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CustomerLocationAddress } from '@utils/address/customerLocation';
import { emptyCustomerLocationAddress } from '@utils/address/customerLocation';

interface AppState {
  isLoading: boolean;
  language: string;
  theme: 'light' | 'dark';
  isUserActiveOrNotModal: boolean;
  inactiveMessage: string;
  userCity: any;
  /** Service / delivery area; drives Home `cityName` queries */
  currentLocationAddress: CustomerLocationAddress | null;
  // Add other app-level state here
}

const initialState: AppState = {
  isLoading: false,
  language: 'en',
  theme: 'light',
  isUserActiveOrNotModal: false,
  inactiveMessage: '',
  userCity: '',
  currentLocationAddress: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setIsUserActiveOrNotModal: (state, action: PayloadAction<boolean>) => {
      state.isUserActiveOrNotModal = action.payload;
    },
    setInactiveMessage: (state, action: PayloadAction<string>) => {
      state.inactiveMessage = action.payload;
    },
    setUserCity: (state, action: PayloadAction<any>) => {
      state.userCity = action.payload;
    },
    setCurrentLocationAddress: (
      state,
      action: PayloadAction<CustomerLocationAddress | null>,
    ) => {
      state.currentLocationAddress = action.payload;
    },
    mergeCurrentLocationAddress: (
      state,
      action: PayloadAction<Partial<CustomerLocationAddress>>,
    ) => {
      const prev = state.currentLocationAddress;
      const defaults = emptyCustomerLocationAddress();
      state.currentLocationAddress = {
        ...defaults,
        ...(prev || {}),
        ...action.payload,
      };
    },
    clearCurrentLocationAddress: state => {
      state.currentLocationAddress = null;
    },
    /**
     * Clears all user-scoped runtime state on logout so the next user does
     * not briefly see the previous user's data. `language` and `theme` are
     * intentionally preserved (they are app preferences, not user data).
     */
    resetUserScopedAppState: state => {
      state.isLoading = false;
      state.isUserActiveOrNotModal = false;
      state.inactiveMessage = '';
      state.userCity = '';
      state.currentLocationAddress = null;
    },
  },
});

export const {
  setLoading,
  setLanguage,
  setTheme,
  setIsUserActiveOrNotModal,
  setInactiveMessage,
  setUserCity,
  setCurrentLocationAddress,
  mergeCurrentLocationAddress,
  clearCurrentLocationAddress,
  resetUserScopedAppState,
} = appSlice.actions;
export default appSlice.reducer;
