import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CustomText, CustomButton, VectoreIcons, ImageLoader } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import imagePaths from '@assets';

type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  assignedMember?: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
  };
};

type ServiceMemberCardProps = {
  service: Service;
  onAssignMember: () => void;
  onChangeMember: () => void;
  onCallMember: () => void;
  onViewLocation: () => void;
};

export default function ServiceMemberCard({
  service,
  onAssignMember,
  onChangeMember,
  onCallMember,
  onViewLocation,
}: ServiceMemberCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <CustomText
            fontSize={theme.fontSize.sm}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.text}
          >
            {service.name}
          </CustomText>
          <View style={styles.serviceMeta}>
            <CustomText
              fontSize={theme.fontSize.xs}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.lightText}
            >
              {service.duration}
            </CustomText>
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.primary}
              style={styles.price}
            >
              ${service.price.toFixed(2)}
            </CustomText>
          </View>
        </View>
      </View>

      {/* Member Assignment Section */}
      <View style={styles.memberSection}>
        {service.assignedMember ? (
          <>
            <View style={styles.memberInfo}>
              <View style={styles.avatarContainer}>
                {service.assignedMember.avatar ? (
                  <ImageLoader
                    source={{ uri: service.assignedMember.avatar }}
                    mainImageStyle={styles.avatar}
                    resizeMode="cover"
                    fallbackImage={imagePaths.barber1}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <CustomText
                      fontSize={theme.fontSize.sm}
                      fontFamily={theme.fonts.SEMI_BOLD}
                      color={theme.colors.white}
                    >
                      {service.assignedMember.name.charAt(0).toUpperCase()}
                    </CustomText>
                  </View>
                )}
              </View>
              <View style={styles.memberDetails}>
                <CustomText
                  fontSize={theme.fontSize.sm}
                  fontFamily={theme.fonts.MEDIUM}
                  color={theme.colors.text}
                >
                  {service.assignedMember.name}
                </CustomText>
                <View style={styles.memberActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={onCallMember}
                  >
                    <VectoreIcons
                      name="call-outline"
                      icon="Ionicons"
                      size={theme.SF(16)}
                      color={theme.colors.primary}
                    />
                    <CustomText
                      fontSize={theme.fontSize.xxs}
                      fontFamily={theme.fonts.REGULAR}
                      color={theme.colors.primary}
                      style={styles.actionText}
                    >
                      Call
                    </CustomText>
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                    onPress={onViewLocation}
                  >
                    <VectoreIcons
                      name="location-outline"
                      icon="Ionicons"
                      size={theme.SF(16)}
                      color={theme.colors.primary}
                    />
                    <CustomText
                      fontSize={theme.fontSize.xxs}
                      fontFamily={theme.fonts.REGULAR}
                      color={theme.colors.primary}
                      style={styles.actionText}
                    >
                      Location
                    </CustomText>
                  </Pressable>
                </View>
              </View>
            </View>
            <CustomButton
              title="Change Member"
              onPress={onChangeMember}
              backgroundColor={theme.colors.primary_light}
              textColor={theme.colors.white}
              buttonStyle={styles.changeButton}
              buttonTextStyle={styles.changeButtonText}
            />
          </>
        ) : (
          <CustomButton
            title="Assign Member"
            onPress={onAssignMember}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            buttonStyle={styles.assignButton}
            buttonTextStyle={styles.assignButtonText}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.SH(8),
    },
    serviceInfo: {
      marginBottom: theme.SH(12),
    },
    serviceHeader: {
      marginBottom: theme.SH(4),
    },
    serviceMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.SH(4),
      gap: theme.SW(12),
    },
    price: {
      marginLeft: 'auto',
    },
    memberSection: {
      marginTop: theme.SH(8),
    },
    memberInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(12),
    },
    avatarContainer: {
      marginRight: theme.SW(12),
    },
    avatar: {
      width: theme.SF(50),
      height: theme.SF(50),
      borderRadius: theme.SF(25),
    },
    avatarPlaceholder: {
      width: theme.SF(50),
      height: theme.SF(50),
      borderRadius: theme.SF(25),
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    memberDetails: {
      flex: 1,
    },
    memberActions: {
      flexDirection: 'row',
      marginTop: theme.SH(8),
      gap: theme.SW(16),
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.SH(4),
      paddingHorizontal: theme.SW(8),
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.secondary,
    },
    actionText: {
      marginLeft: theme.SW(4),
    },
    assignButton: {
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.SH(10),
    },
    assignButtonText: {
      fontSize: theme.fontSize.sm,
    },
    changeButton: {
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.SH(10),
    },
    changeButtonText: {
      fontSize: theme.fontSize.sm,
    },
  });
