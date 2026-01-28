import { View, StyleSheet, Pressable, Modal } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, VectoreIcons } from '@components/common';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: string;
  iconFamily?: 'Ionicons' | 'FontAwesome' | 'Entypo' | 'MaterialIcons';
  onPress: () => void;
  color?: string;
}

interface ActionMenuProps {
  visible: boolean;
  items: ActionMenuItem[];
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function ActionMenu({ visible, items, onClose, position }: ActionMenuProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!visible) return null;

  const dynamicPositionStyle = position
    ? {
        position: 'absolute' as const,
        top: position.y,
        right: position.x || theme.SW(20),
      }
    : {};

  return (
    <Modal
      statusBarTranslucent={true}
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menuContainer, dynamicPositionStyle]}>
          {items.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.menuItem,
                index < items.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => {
                item.onPress();
                onClose();
              }}
            >
              <VectoreIcons
                name={item.icon}
                size={theme.SF(20)}
                icon={item.iconFamily || 'Ionicons'}
                color={item.color || theme.colors.text}
              />
              <CustomText style={styles.menuItemText}>{item.label}</CustomText>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: theme.SH(60),
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    minWidth: theme.SW(180),
    marginRight: theme.SW(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.SH(12),
    paddingHorizontal: theme.SW(16),
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary || '#EAEAEA',
  },
  menuItemText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.MEDIUM,
    marginLeft: theme.SW(12),
  },
});
