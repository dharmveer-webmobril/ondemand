import React, { useCallback, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  TextLayoutEventData,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@utils/theme';
import CustomText from './CustomText';

type ExpandableTextProps = {
  text?: string;
  /** Collapsed line count before "See more" appears. */
  numberOfLines?: number;
  textStyle?: StyleProp<TextStyle>;
  toggleStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function ExpandableText({
  text = '',
  numberOfLines = 4,
  textStyle,
  toggleStyle,
  containerStyle,
}: ExpandableTextProps) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const measuredRef = useRef(false);

  const handleMeasureLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (measuredRef.current) return;
      measuredRef.current = true;
      if ((event.nativeEvent.lines?.length ?? 0) > numberOfLines) {
        setNeedsToggle(true);
      }
    },
    [numberOfLines],
  );

  return (
    <View style={containerStyle}>
      {/* Invisible full-text copy, only used to count the real line count. */}
      <CustomText
        style={[textStyle, styles.measure] as any}
        onTextLayout={handleMeasureLayout}
      >
        {text}
      </CustomText>

      <CustomText
        style={textStyle as any}
        numberOfLines={expanded ? undefined : numberOfLines}
      >
        {text}
      </CustomText>

      {needsToggle ? (
        <Pressable
          onPress={() => setExpanded(prev => !prev)}
          hitSlop={8}
          style={styles.toggleButton}
        >
          <CustomText
            style={[
              { color: theme.colors.primary, fontFamily: theme.fonts.SEMI_BOLD },
              toggleStyle,
            ] as any}
          >
            {expanded ? t('common.seeLess') : t('common.seeMore')}
          </CustomText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
});
