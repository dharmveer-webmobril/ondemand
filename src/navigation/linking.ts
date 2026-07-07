import type { LinkingOptions } from '@react-navigation/native';
import { getStateFromPath as defaultGetStateFromPath } from '@react-navigation/native';
import { Linking } from 'react-native';
import { LINKING_PREFIXES } from '@utils/deepLinkConfig';
import { navigateFromAssistantUrl } from '@utils/aiAssistantNavigation';
import SCREEN_NAMES from './ScreenNames';
import {
  captureProviderProfileUrl,
  handleProviderProfileDeepLink,
  parseProviderProfileShareUrl,
} from '@utils/providerProfileDeepLink';

/**
 * React Navigation linking — maps URL paths to ProviderDetails.
 * Profile-share URLs are deferred until auth is hydrated (see getInitialURL / subscribe).
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
  /**
   * Cold start: capture profile-share links but do not navigate yet.
   * Navigation runs after splash/login via tryOpenPendingProviderProfile().
   */
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (!url) return undefined;
    if (parseProviderProfileShareUrl(url)) {
      captureProviderProfileUrl(url);
      return undefined;
    }
    return url;
  },
  /** Warm start: route profile links through auth-aware handler instead of RN auto-nav. */
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => {
      if (handleProviderProfileDeepLink(url)) return;
      if (navigateFromAssistantUrl(url)) return;
      listener(url);
    };
    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => subscription.remove();
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
