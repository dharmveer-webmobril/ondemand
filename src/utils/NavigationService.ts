import * as React from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function navigate(name: string, params?: object) {
  navigationRef.current?.navigate(name, params);
}

export function goBack() {
  navigationRef.current?.goBack();
}

export function reset(name: string, index: number = 0) {
  navigationRef.current?.reset({
    index,
    routes: [{ name }],
  });
}
