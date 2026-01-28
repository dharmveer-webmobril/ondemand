import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import { CustomText, CustomButton, VectoreIcons, ImageLoader, CustomInput } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import imagePaths from '@assets';

export type Member = {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  role?: string;
  rating?: number;
  isAvailable?: boolean;
};

type MemberSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (member: Member) => void;
  serviceName?: string;
  currentMemberId?: string;
};

// Mock members data - Replace with API data
const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    avatar: undefined,
    phone: '+1987654321',
    role: 'Senior Barber',
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Sarah Williams',
    avatar: undefined,
    phone: '+1987654322',
    role: 'Hair Stylist',
    rating: 4.9,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'David Brown',
    avatar: undefined,
    phone: '+1987654323',
    role: 'Barber',
    rating: 4.7,
    isAvailable: false,
  },
  {
    id: '4',
    name: 'Emily Davis',
    avatar: undefined,
    phone: '+1987654324',
    role: 'Hair Stylist',
    rating: 4.6,
    isAvailable: true,
  },
  {
    id: '5',
    name: 'James Wilson',
    avatar: undefined,
    phone: '+1987654325',
    role: 'Senior Barber',
    rating: 4.9,
    isAvailable: true,
  },
];

export default function MemberSelectionModal({
  visible,
  onClose,
  onSelect,
  serviceName,
  currentMemberId,
}: MemberSelectionModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockMembers;
    }
    const query = searchQuery.toLowerCase();
    return mockMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = useCallback(() => {
    if (selectedMemberId) {
      const member = mockMembers.find((m) => m.id === selectedMemberId);
      if (member) {
        onSelect(member);
        setSelectedMemberId(null);
        setSearchQuery('');
      }
    }
  }, [selectedMemberId, onSelect]);

  const handleMemberPress = useCallback((memberId: string) => {
    setSelectedMemberId(memberId === selectedMemberId ? null : memberId);
  }, [selectedMemberId]);

  const renderMemberItem = useCallback(
    ({ item }: { item: Member }) => {
      const isSelected = selectedMemberId === item.id;
      const isCurrentMember = currentMemberId === item.id;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.memberItem,
            isSelected && styles.selectedMemberItem,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => item.isAvailable && handleMemberPress(item.id)}
          disabled={!item.isAvailable}
        >
          <View style={styles.memberContent}>
            <View style={styles.avatarContainer}>
              {item.avatar ? (
                <ImageLoader
                  source={{ uri: item.avatar }}
                  mainImageStyle={styles.avatar}
                  resizeMode="cover"
                  fallbackImage={imagePaths.barber1}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <CustomText
                    fontSize={theme.fontSize.md}
                    fontFamily={theme.fonts.SEMI_BOLD}
                    color={theme.colors.white}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </CustomText>
                </View>
              )}
              {!item.isAvailable && (
                <View style={styles.unavailableBadge}>
                  <CustomText
                    fontSize={theme.fontSize.xxs}
                    fontFamily={theme.fonts.SEMI_BOLD}
                    color={theme.colors.white}
                  >
                    Busy
                  </CustomText>
                </View>
              )}
            </View>
            <View style={styles.memberInfo}>
              <View style={styles.memberHeader}>
                <CustomText
                  fontSize={theme.fontSize.sm}
                  fontFamily={theme.fonts.SEMI_BOLD}
                  color={theme.colors.text}
                >
                  {item.name}
                </CustomText>
                {isCurrentMember && (
                  <View style={styles.currentBadge}>
                    <CustomText
                      fontSize={theme.fontSize.xxs}
                      fontFamily={theme.fonts.SEMI_BOLD}
                      color={theme.colors.primary}
                    >
                      Current
                    </CustomText>
                  </View>
                )}
              </View>
              {item.role && (
                <CustomText
                  fontSize={theme.fontSize.xs}
                  fontFamily={theme.fonts.REGULAR}
                  color={theme.colors.lightText}
                  marginTop={theme.SH(2)}
                >
                  {item.role}
                </CustomText>
              )}
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <VectoreIcons
                    name="star"
                    icon="Ionicons"
                    size={theme.SF(14)}
                    color={theme.colors.warningColor}
                  />
                  <CustomText
                    fontSize={theme.fontSize.xs}
                    fontFamily={theme.fonts.REGULAR}
                    color={theme.colors.text}
                    style={styles.ratingText}
                  >
                    {item.rating.toFixed(1)}
                  </CustomText>
                </View>
              )}
            </View>
            {isSelected && (
              <View style={styles.checkIcon}>
                <VectoreIcons
                  name="checkmark-circle"
                  icon="Ionicons"
                  size={theme.SF(24)}
                  color={theme.colors.primary}
                />
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [selectedMemberId, currentMemberId, theme, styles, handleMemberPress]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <CustomText
                fontSize={theme.fontSize.lg}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
              >
                {serviceName ? `Assign Member - ${serviceName}` : 'Select Member'}
              </CustomText>
              {serviceName && (
                <CustomText
                  fontSize={theme.fontSize.xs}
                  fontFamily={theme.fonts.REGULAR}
                  color={theme.colors.lightText}
                  marginTop={theme.SH(4)}
                >
                  Choose a member for this service
                </CustomText>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <VectoreIcons
                name="close"
                icon="Ionicons"
                size={theme.SF(24)}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <CustomInput
              placeholder="Search members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              inputTheme="default"
              withBackground={theme.colors.secondary}
            />
          </View>

          {/* Members List */}
          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.id}
            renderItem={renderMemberItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <CustomText
                  fontSize={theme.fontSize.sm}
                  fontFamily={theme.fonts.REGULAR}
                  color={theme.colors.lightText}
                  textAlign="center"
                >
                  No members found
                </CustomText>
              </View>
            }
          />

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <CustomButton
              title="Cancel"
              onPress={onClose}
              backgroundColor={theme.colors.secondary}
              textColor={theme.colors.text}
              buttonStyle={styles.cancelButton}
              marginRight={theme.SW(8)}
            />
            <CustomButton
              title="Assign"
              onPress={handleSelect}
              backgroundColor={theme.colors.primary}
              textColor={theme.colors.white}
              buttonStyle={styles.assignButton}
              disable={!selectedMemberId}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? theme.SH(30) : theme.SH(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: theme.SW(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },
    headerContent: {
      flex: 1,
      marginRight: theme.SW(12),
    },
    closeButton: {
      width: theme.SF(32),
      height: theme.SF(32),
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      padding: theme.SW(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },
    listContent: {
      padding: theme.SW(16),
    },
    memberItem: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.SW(12),
      marginBottom: theme.SH(12),
      borderWidth: 1,
      borderColor: theme.colors.gray,
    },
    selectedMemberItem: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      backgroundColor: theme.colors.secondary,
    },
    memberContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
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
    unavailableBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: theme.colors.red,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.SW(4),
      paddingVertical: theme.SH(2),
    },
    memberInfo: {
      flex: 1,
    },
    memberHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
    },
    currentBadge: {
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.SW(6),
      paddingVertical: theme.SH(2),
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.SH(4),
    },
    ratingText: {
      marginLeft: theme.SW(4),
    },
    checkIcon: {
      marginLeft: theme.SW(8),
    },
    emptyContainer: {
      paddingVertical: theme.SH(40),
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      padding: theme.SW(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray,
    },
    cancelButton: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
      marginRight:6
    },
    assignButton: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
      marginLeft:6
    },
  });
