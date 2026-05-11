import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
import imagePaths from '@assets';

export type ReviewChipItem = {
  id: string;
  label: string;
  imageSource?: any;
  rated?: boolean;
};

type ReviewChipsStripProps = {
  items: ReviewChipItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function ReviewChipsStrip({
  items,
  selectedId,
  onSelect,
}: ReviewChipsStripProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const scrollRef = useRef<ScrollView | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const overflowing = contentWidth > containerWidth + 1;
  const canLeft = overflowing && scrollX > 1;
  const canRight = overflowing && scrollX + containerWidth < contentWidth - 1;

  const onLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);
  const onContentSizeChange = (w: number) => setContentWidth(w);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setScrollX(e.nativeEvent.contentOffset.x);

  const scrollBy = (delta: number) => {
    const next = Math.max(
      0,
      Math.min(contentWidth - containerWidth, scrollX + delta),
    );
    scrollRef.current?.scrollTo({ x: next, animated: true });
  };

  return (
    <View style={styles.bar}>
      {overflowing ? (
        <Pressable
          hitSlop={6}
          onPress={() => scrollBy(-140)}
          disabled={!canLeft}
          style={[
            styles.arrow,
            ...(canLeft ? [] : [styles.arrowDisabled]),
          ]}
        >
          <VectoreIcons
            icon="Ionicons"
            name="chevron-back"
            size={theme.SF(14)}
            color={canLeft ? theme.colors.primary : theme.colors.lightText}
          />
        </Pressable>
      ) : null}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {items.map(item => {
          const active = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[
                styles.chip,
                ...(active ? [styles.chipActive] : []),
              ]}
            >
              {item.imageSource ? (
                <View style={styles.chipAvatar}>
                  <ImageLoader
                    source={item.imageSource}
                    mainImageStyle={styles.chipAvatarImage}
                    resizeMode="cover"
                    fallbackImage={imagePaths.no_image}
                  />
                </View>
              ) : null}
              <CustomText
                style={[
                  styles.chipText,
                  ...(active ? [styles.chipTextActive] : []),
                ]}
                numberOfLines={1}
              >
                {item.label}
              </CustomText>
              {item.rated ? (
                <View style={styles.chipDot}>
                  <VectoreIcons
                    icon="Ionicons"
                    name="checkmark"
                    size={theme.SF(9)}
                    color={theme.colors.white}
                  />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {overflowing ? (
        <Pressable
          hitSlop={6}
          onPress={() => scrollBy(140)}
          disabled={!canRight}
          style={[
            styles.arrow,
            ...(canRight ? [] : [styles.arrowDisabled]),
          ]}
        >
          <VectoreIcons
            icon="Ionicons"
            name="chevron-forward"
            size={theme.SF(14)}
            color={canRight ? theme.colors.primary : theme.colors.lightText}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(10),
    },
    scroll: {
      flexGrow: 1,
      flexShrink: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.SW(2),
      gap: theme.SW(6),
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
      borderRadius: theme.SF(16),
      borderWidth: 1,
      borderColor: theme.colors.border || '#E5E7EB',
      backgroundColor: theme.colors.white,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipAvatar: {
      width: theme.SF(18),
      height: theme.SF(18),
      borderRadius: theme.SF(9),
      overflow: 'hidden',
      marginRight: theme.SW(6),
      backgroundColor: theme.colors.gray || '#F1F1F1',
    },
    chipAvatarImage: {
      width: '100%',
      height: '100%',
    },
    chipText: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.text,
      maxWidth: theme.SW(140),
    },
    chipTextActive: {
      color: theme.colors.white,
      fontFamily: theme.fonts?.SEMI_BOLD,
    },
    chipDot: {
      marginLeft: theme.SW(4),
      width: theme.SF(13),
      height: theme.SF(13),
      borderRadius: theme.SF(7),
      backgroundColor: '#22C55E',
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrow: {
      width: theme.SF(24),
      height: theme.SF(24),
      borderRadius: theme.SF(12),
      borderWidth: 1,
      borderColor: theme.colors.border || '#E5E7EB',
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.SW(3),
    },
    arrowDisabled: {
      opacity: 0.4,
    },
  });
