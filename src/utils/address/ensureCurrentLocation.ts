import type { QueryClient } from '@tanstack/react-query';
import type { AppDispatch, RootState } from '@store/index';
import axiosInstance from '@services/api/axiosInstance';
import EndPoints from '@services/api/EndPoints';
import { setCurrentLocationAddress } from '@store/slices/appSlice';
import { mapApiAddressToCustomerLocation } from './customerLocation';
import { tryResolveLocationFromDevice } from './deviceLocation';

let inflight: Promise<void> | null = null;

/**
 * 1) Always tries fresh GPS + reverse geocode → `setCurrentLocationAddress` (lat/lng updated)
 * 2) If GPS fails, keeps existing Redux address if any; else first saved address from GET `/auth/customer/addresses`
 * De-duplicated across Splash, Home, AppState resume, etc.
 */
export async function ensureCurrentLocationHydrated(
  dispatch: AppDispatch,
  queryClient: QueryClient,
  getState: () => RootState,
): Promise<void> {
  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    try {
      const fromGps = await tryResolveLocationFromDevice();
      if (fromGps) {
        dispatch(setCurrentLocationAddress(fromGps));
        return;
      }

      if (getState().app.currentLocationAddress != null) return;

      const data = await queryClient.fetchQuery({
        queryKey: ['customerAddresses'],
        queryFn: async () => {
          const res = await axiosInstance.get<{
            ResponseData?: unknown[];
          }>(EndPoints.GET_CUSTOMER_ADDRESSES);
          return res.data;
        },
      });

      const list = data?.ResponseData;
      if (Array.isArray(list) && list.length > 0) {
        const mapped = mapApiAddressToCustomerLocation(list[0]);
        if (mapped) {
          dispatch(setCurrentLocationAddress(mapped));
        }
      }
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
