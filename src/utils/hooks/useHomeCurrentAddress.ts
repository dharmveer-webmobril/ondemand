import { useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { clearCurrentLocationAddress } from '@store/slices/appSlice';
import { ensureCurrentLocationHydrated } from '@utils/address';
import { queryClient } from '@services/api';
import { store } from '@store/index';

/**
 * Resolves `currentLocationAddress` with a fresh GPS read on mount and when
 * returning from background. Falls back to first saved address if GPS fails and
 * nothing is in Redux. Splash may start the same work earlier — de-duplicated.
 */
export function useHomeCurrentAddress() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.auth.token);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const current = useAppSelector(state => state.app.currentLocationAddress);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      dispatch(clearCurrentLocationAddress());
    }
  }, [token, isAuthenticated, dispatch]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    void ensureCurrentLocationHydrated(dispatch, queryClient, () => store.getState());
  }, [token, isAuthenticated, dispatch]);

  /** Fresh GPS when returning from background (user taps app icon / task switcher). */
  useEffect(() => {
    if (!token || !isAuthenticated) return;
    const sub = AppState.addEventListener('change', next => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (next !== 'active' || prev !== 'background') return;
      void ensureCurrentLocationHydrated(
        dispatch,
        queryClient,
        () => store.getState(),
      );
    });
    return () => sub.remove();
  }, [token, isAuthenticated, dispatch]);

  const refetchSavedAddresses = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
  }, []);

  return {
    currentLocationAddress: current,
    refetchSavedAddresses,
  };
}
