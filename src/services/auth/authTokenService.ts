import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppDispatch } from '@store';
import { setToken, updateToken } from '@store/slices/authSlice';
import {
  deleteTokenFromKeychain,
  getTokenFromKeychain,
  saveTokenToKeychain,
} from './keychainService';

const AUTH_PERSIST_KEY = 'persist:auth';

async function getLegacyPersistedToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_PERSIST_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { token?: string };
    if (!parsed.token) {
      return null;
    }

    const token = JSON.parse(parsed.token) as string | null;
    return token || null;
  } catch {
    return null;
  }
}

async function clearLegacyPersistedToken(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_PERSIST_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Record<string, string>;
    if (!parsed.token) {
      return;
    }

    delete parsed.token;
    await AsyncStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(parsed));
  } catch {
    // Non-blocking cleanup
  }
}

export async function setAuthToken(
  dispatch: AppDispatch,
  token: string,
): Promise<void> {
  await saveTokenToKeychain(token);
  dispatch(setToken(token));
}

export async function updateAuthToken(
  dispatch: AppDispatch,
  token: string,
): Promise<void> {
  await saveTokenToKeychain(token);
  dispatch(updateToken(token));
}

export async function hydrateAuthToken(
  dispatch: AppDispatch,
  legacyToken?: string | null,
): Promise<string | null> {
  let token = await getTokenFromKeychain();

  if (!token) {
    const migratedToken = legacyToken ?? (await getLegacyPersistedToken());
    if (migratedToken) {
      await saveTokenToKeychain(migratedToken);
      await clearLegacyPersistedToken();
      token = migratedToken;
    }
  }

  if (token) {
    dispatch(setToken(token));
  }

  return token;
}

export async function clearAuthToken(dispatch: AppDispatch): Promise<void> {
  try {
    await deleteTokenFromKeychain();
  } catch {
    // Best-effort cleanup
  }
  dispatch(setToken(null));
}

export async function readStoredAuthToken(): Promise<string | null> {
  return getTokenFromKeychain();
}
