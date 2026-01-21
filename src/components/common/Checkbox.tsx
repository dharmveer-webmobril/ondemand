import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useThemeContext } from '@utils/theme';
import CustomText from './CustomText';
import VectoreIcons from './VectoreIcons';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  size?: number;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, size = 20 }) => {
  const theme = useThemeContext();

  return (
    <Pressable
      onPress={onChange}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: theme.SF(size),
            height: theme.SF(size),
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {checked && (
          <VectoreIcons
            name="checkmark"
            icon="Ionicons"
            size={theme.SF(size * 0.7)}
            color={theme.colors.white}
          />
        )}
      </View>
      {label && (
        <CustomText
          style={styles.label}
          color={theme.colors.text}
          fontSize={theme.SF(14)}
          fontFamily={theme.fonts.REGULAR}
        >
          {label}
        </CustomText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    marginLeft: 4,
  },
});

export default Checkbox;
