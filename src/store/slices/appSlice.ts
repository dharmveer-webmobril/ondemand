import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  language: string;
  theme: 'light' | 'dark';
  isUserActiveOrNotModal: boolean;
  inactiveMessage: string;
  // Add other app-level state here
}

const initialState: AppState = {
  isLoading: false,
  language: 'en',
  theme: 'light',
  isUserActiveOrNotModal: false,
  inactiveMessage: '',
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
  },
});

export const { setLoading, setLanguage, setTheme, setIsUserActiveOrNotModal, setInactiveMessage } = appSlice.actions;
export default appSlice.reducer;
