import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type SpacingProps = {
  space?: number | string;
  horizontal?: boolean;
  backgroundColor?: string;
};

const Spacing: React.FC<SpacingProps> = ({ space = 10, horizontal = false, backgroundColor = 'transparent' }) => {
  const styles = useMemo(() => {
    return StyleSheet.create({
      spacerStyle: {
        [horizontal ? 'width' : 'height']: space,
        backgroundColor,
      } as ViewStyle, // Specify ViewStyle to avoid TypeScript type errors
    });
  }, [horizontal, space, backgroundColor]);

  return <View style={styles.spacerStyle} />;
};

export default Spacing;
