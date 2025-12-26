import { View, StyleSheet, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';

interface ProfileHeaderProps {
  name: string;
  phone: string;
  image?: any;
  onEditPress?: () => void;
  onSharePress?: () => void;
}

export default function ProfileHeader({
  name,
  phone,
  image,
  onEditPress,
  onSharePress,
}: ProfileHeaderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ImageLoader
        source={image}
        mainImageStyle={styles.profileImage}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <CustomText style={styles.nameText}>{name}</CustomText>
        <CustomText style={styles.phoneText}>{phone}</CustomText>
      </View>
      <View style={styles.actionsContainer}>
        <Pressable style={styles.actionButton} onPress={onEditPress}>
          <View style={styles.iconContainer}>
            <VectoreIcons
              name="create-outline"
              size={theme.SF(20)}
              icon="Ionicons"
              color={theme.colors.white}
            />
          </View>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onSharePress}>
          <View style={styles.iconContainer}>
            <VectoreIcons
              name="share-outline"
              size={theme.SF(20)}
              icon="Ionicons"
              color={theme.colors.white}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(10),
    backgroundColor: theme.colors.white,
  },
  profileImage: {
    width: theme.SF(80),
    height: theme.SF(80),
    borderRadius: theme.SF(40),
    marginRight: theme.SW(15),
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontFamily: theme.fonts.BOLD,
    marginBottom: theme.SF(4),
  },
  phoneText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.SW(10),
  },
  actionButton: {
    marginLeft: theme.SW(8),
  },
  iconContainer: {
    width: theme.SF(40),
    height: theme.SF(40),
    borderRadius: theme.SF(20),
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

