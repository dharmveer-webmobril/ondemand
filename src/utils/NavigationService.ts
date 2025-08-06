import * as React from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function navigate(name: string, params?: object) {
  navigationRef.current?.navigate(name, params);
}

export function goBack() {
  navigationRef.current?.goBack();
}

/**
 * Resets the navigation stack to a single route with optional parameters.
 * @param name The name of the route to navigate to.
 * @param params Optional parameters to pass to the route.
 * @param index The index of the route in the stack (default: 0).
 */
export function resetNavigation(name: string, params: object = {}, index: number = 0) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.dispatch(
      CommonActions.reset({
        index,
        routes: [{ name, params }],
      })
    );
  } else {
    console.warn('Navigation is not ready');
  }
}

/**
 * Resets the navigation stack to a single route (legacy reset function).
 * @param name The name of the route to navigate to.
 * @param index The index of the route in the stack (default: 0).
 * @deprecated Use resetNavigation instead for more flexibility.
 */
export function reset(name: string, index: number = 0) {
  console.warn('Deprecated: Use resetNavigation instead');
  resetNavigation(name, {}, index);
}