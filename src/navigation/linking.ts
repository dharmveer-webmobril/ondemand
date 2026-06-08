import type { LinkingOptions } from '@react-navigation/native';
import { getStateFromPath as defaultGetStateFromPath } from '@react-navigation/native';
import { LINKING_PREFIXES } from '@utils/deepLinkConfig';
import SCREEN_NAMES from './ScreenNames';
import { parseProviderProfileShareUrl } from '@utils/providerProfileDeepLink';

/**
 * React Navigation linking — maps URL paths to ProviderDetails.
 * Pending / auth flows are still handled in providerProfileDeepLink.ts.
 */
export const linking: LinkingOptions<any> = {
  prefixes: [...LINKING_PREFIXES],
  config: {
    screens: {
      [SCREEN_NAMES.PROVIDER_DETAILS]: {
        path: 'profile/:spId',
        parse: {
          spId: (id: string) => id,
        },
      },
    },
  },
  getStateFromPath(path: any, options: any) {
    const spId = parseProviderProfileShareUrl(path) ?? parseProviderProfileShareUrl(`/${path}`);
    if (spId) {
      return {
        routes: [
          {
            name: SCREEN_NAMES.PROVIDER_DETAILS,
            params: {
              spId,
              provider: { id: spId },
              prevScreenFlag: 'without_data',
            },
          },
        ],
      };
    }
    return defaultGetStateFromPath(path, options);
  },
};
