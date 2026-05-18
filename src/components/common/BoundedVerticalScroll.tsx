import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeContext } from '@utils/theme';

type BoundedVerticalScrollProps = {
  children: React.ReactNode;
  itemCount: number;
  /** Enable inner scroll when count exceeds this (default 4). */
  scrollThreshold?: number;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function BoundedVerticalScroll({
  children,
  itemCount,
  scrollThreshold = 4,
  maxHeight,
  style,
  contentContainerStyle,
}: BoundedVerticalScrollProps) {
  const theme = useThemeContext();
  const useScroll = itemCount > scrollThreshold;
  const scrollMaxHeight = maxHeight ?? theme.SH(240);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        box: {
          overflow: 'hidden',
        },
        scroll: useScroll ? { maxHeight: scrollMaxHeight } : undefined,
      }),
    [useScroll, scrollMaxHeight],
  );

  if (!useScroll) {
    return <View style={[styles.box, style]}>{children}</View>;
  }

  return (
    <View style={[styles.box, style]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}
