import SCREEN_NAMES from '@navigation/ScreenNames';

export interface PostAuthDestination {
  screen: string;
  params?: Record<string, unknown>;
}

/**
 * Resolves post-authentication destination for registered customers.
 */
export function getPostAuthDestination(
  hasInterests: boolean,
): PostAuthDestination {
  if (hasInterests) {
    return { screen: SCREEN_NAMES.HOME };
  }

  return {
    screen: SCREEN_NAMES.INTEREST_CHOOSE,
    params: { prevScreen: 'auth' },
  };
}

export function customerHasInterests(
  userDetails: { interests?: unknown[] } | null | undefined,
): boolean {
  return Boolean(userDetails?.interests && userDetails.interests.length > 0);
}
