import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Container, AppHeader, CustomText, CustomButton, VectoreIcons, CustomInput } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RescheduleModal from '@components/booking/RescheduleModal';
import ReasonInputModal from '@components/booking/ReasonInputModal';
import ServiceMemberCard from '@components/booking/ServiceMemberCard';
import MemberSelectionModal, { Member } from '@components/booking/MemberSelectionModal';
import { SweetAlert } from '@components/common';
import imagePaths from '@assets';

type BookingStatus = 'PENDING' | 'ACCEPTED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';

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

type BookingDetailData = {
  id: string;
  bookingId: string;
  status: BookingStatus;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  customerNotes?: string;
  bookingDate: string;
  timeSlot: string;
  services: Service[];
  totalPrice: number;
};

// Mock data - Replace with API data
const mockBookingData: BookingDetailData = {
  id: '1',
  bookingId: 'BK001',
  status: 'ACCEPTED',
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  serviceAddress: '1893 Cheshire Bridge Rd Ne, Atlanta, GA 30325',
  customerNotes: 'Please arrive 10 minutes early. Ring the doorbell twice.',
  bookingDate: '06-March-2025',
  timeSlot: '8:00 am - 8:30 am',
  services: [
    {
      id: '1',
      name: 'Haircut + Beard',
      duration: '30m',
      price: 55.00,
      assignedMember: {
        id: '1',
        name: 'Mike Johnson',
        avatar: undefined,
        phone: '+1987654321',
      },
    },
    {
      id: '2',
      name: 'Only Haircut',
      duration: '25m',
      price: 45.00,
    },
  ],
  totalPrice: 100.00,
};

export default function BookingDetail() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const bookingData = (route.params as any)?.booking || mockBookingData;
  const [booking, setBooking] = useState<BookingDetailData>(bookingData);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showMemberSelectionModal, setShowMemberSelectionModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [pendingMember, setPendingMember] = useState<Member | null>(null);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const getStatusColor = useCallback((status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return theme.colors.warningColor;
      case 'ACCEPTED':
        return '#4CAF50';
      case 'RESCHEDULED':
        return theme.colors.primary_light;
      case 'CANCELLED':
        return theme.colors.red;
      case 'COMPLETED':
        return '#4CAF50';
      default:
        return theme.colors.text;
    }
  }, [theme]);

  const handleCall = useCallback((phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to make phone call');
      });
  }, []);

  const handleOpenMaps = useCallback((address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps://app?daddr=${encodedAddress}`,
      android: `google.navigation:q=${encodedAddress}`,
    });

    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // Fallback to web maps
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
          }
        })
        .catch(() => {
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
        });
    }
  }, []);

  const handleAccept = useCallback(() => {
    setBooking((prev) => ({ ...prev, status: 'ACCEPTED' }));
    setShowAcceptConfirm(false);
    // TODO: API call to accept booking
  }, []);

  const handleReject = useCallback(() => {
    setBooking((prev) => ({ ...prev, status: 'CANCELLED' }));
    setShowRejectConfirm(false);
    // TODO: API call to reject booking
  }, []);

  const handleCancel = useCallback(() => {
    setBooking((prev) => ({ ...prev, status: 'CANCELLED' }));
    setShowCancelConfirm(false);
    // TODO: API call to cancel booking
  }, []);

  const handleReschedule = useCallback((newDate: string, newTime: string) => {
    setBooking((prev) => ({
      ...prev,
      bookingDate: newDate,
      timeSlot: newTime,
      status: 'RESCHEDULED',
    }));
    setShowRescheduleModal(false);
    // TODO: API call to reschedule
  }, []);

  const handleAssignMember = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowMemberSelectionModal(true);
  }, []);

  const handleChangeMember = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowMemberSelectionModal(true);
  }, []);


  const handleMemberSelect = useCallback((member: Member) => {
    if (selectedServiceId) {
      const service = booking.services.find(s => s.id === selectedServiceId);
      const isChangingMember = service?.assignedMember !== undefined;
      
      if (isChangingMember && service?.assignedMember?.id !== member.id) {
        // If changing member, show reason modal first
        setPendingMember(member);
        setShowMemberSelectionModal(false);
        setShowReasonModal(true);
      } else {
        // Direct assignment (new member or same member)
        setBooking((prev) => ({
          ...prev,
          services: prev.services.map((s) =>
            s.id === selectedServiceId
              ? {
                  ...s,
                  assignedMember: {
                    id: member.id,
                    name: member.name,
                    avatar: member.avatar,
                    phone: member.phone,
                  },
                }
              : s
          ),
        }));
        setShowMemberSelectionModal(false);
        setSelectedServiceId(null);
        // TODO: API call to assign member to service
      }
    }
  }, [selectedServiceId, booking.services]);

  const handleMemberChangeWithReason = useCallback((reason: string) => {
    if (selectedServiceId && pendingMember) {
      setBooking((prev) => ({
        ...prev,
        services: prev.services.map((s) =>
          s.id === selectedServiceId
            ? {
                ...s,
                assignedMember: {
                  id: pendingMember.id,
                  name: pendingMember.name,
                  avatar: pendingMember.avatar,
                  phone: pendingMember.phone,
                },
              }
            : s
        ),
      }));
      // TODO: API call to change member with reason
      setPendingMember(null);
      setShowReasonModal(false);
      setSelectedServiceId(null);
    }
  }, [selectedServiceId, pendingMember]);

  const handleReschedulePress = useCallback(() => {
    setShowRescheduleModal(true);
  }, []);

  return (
    <Container safeArea={false} statusBarColor={theme.colors.white} style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <AppHeader
          title="Booking Details"
          onLeftPress={() => navigation.goBack()}
          backgroundColor={theme.colors.white}
          tintColor={theme.colors.text}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Header */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <View style={styles.bookingIdContainer}>
              <CustomText
                fontSize={theme.fontSize.xs}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
              >
                Booking ID
              </CustomText>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
                marginTop={theme.SH(4)}
              >
                {booking.bookingId}
              </CustomText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
              <CustomText
                fontSize={theme.fontSize.xxs}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.white}
              >
                {booking.status}
              </CustomText>
            </View>
          </View>
          <View style={styles.customerHeaderRow}>
            <CustomText
              fontSize={theme.fontSize.lg}
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.text}
            >
              {booking.customerName}
            </CustomText>
            <Pressable
              style={styles.callButton}
              onPress={() => handleCall(booking.customerPhone)}
            >
              <VectoreIcons
                name="phone"
                icon="Ionicons"
                size={theme.SF(20)}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* Customer Details Card */}
        <View style={styles.card}>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.text}
            marginBottom={theme.SH(12)}
          >
            Customer Details
          </CustomText>
          <View style={styles.detailRow}>
            <VectoreIcons
              name="person-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.lightText}
            />
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.text}
              style={styles.detailText}
            >
              {booking.customerName}
            </CustomText>
          </View>
          <Pressable
            style={styles.detailRow}
            onPress={() => handleCall(booking.customerPhone)}
          >
            <VectoreIcons
              name="call-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.lightText}
            />
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.primary}
              style={styles.detailText}
            >
              {booking.customerPhone}
            </CustomText>
          </Pressable>
          <View style={styles.detailRow}>
            <VectoreIcons
              name="location-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.lightText}
            />
            <View style={styles.addressContainer}>
              <CustomText
                fontSize={theme.fontSize.sm}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.text}
                style={styles.detailText}
              >
                {booking.serviceAddress}
              </CustomText>
            </View>
          </View>
          {booking.customerNotes && (
            <View style={styles.notesContainer}>
              <CustomText
                fontSize={theme.fontSize.xs}
                fontFamily={theme.fonts.MEDIUM}
                color={theme.colors.text}
                marginBottom={theme.SH(4)}
              >
                Notes:
              </CustomText>
              <CustomText
                fontSize={theme.fontSize.xs}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
              >
                {booking.customerNotes}
              </CustomText>
            </View>
          )}
        </View>

        {/* Date & Time Card */}
        <View style={styles.card}>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.text}
            marginBottom={theme.SH(12)}
          >
            Date & Time
          </CustomText>
          <View style={styles.detailRow}>
            <VectoreIcons
              name="calendar-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.lightText}
            />
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.text}
              style={styles.detailText}
            >
              {booking.bookingDate}
            </CustomText>
          </View>
          <View style={styles.detailRow}>
            <VectoreIcons
              name="time-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.lightText}
            />
            <CustomText
              fontSize={theme.fontSize.sm}
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.text}
              style={styles.detailText}
            >
              {booking.timeSlot}
            </CustomText>
          </View>
          <CustomButton
            title="Reschedule"
            onPress={handleReschedulePress}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            buttonStyle={styles.rescheduleButton}
            buttonTextStyle={styles.rescheduleButtonText}
            marginTop={theme.SH(12)}
          />
        </View>

        {/* Services List */}
        <View style={styles.card}>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.text}
            marginBottom={theme.SH(12)}
          >
            Services
          </CustomText>
          {booking.services.map((service, index) => (
            <View key={service.id}>
              <ServiceMemberCard
                service={service}
                onAssignMember={() => handleAssignMember(service.id)}
                onChangeMember={() => handleChangeMember(service.id)}
                onCallMember={() => service.assignedMember?.phone && handleCall(service.assignedMember.phone)}
                onViewLocation={() => handleOpenMaps(booking.serviceAddress)}
              />
              {index < booking.services.length - 1 && <View style={styles.serviceDivider} />}
            </View>
          ))}
          <View style={styles.totalContainer}>
            <CustomText
              fontSize={theme.fontSize.md}
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.text}
            >
              Total
            </CustomText>
            <CustomText
              fontSize={theme.fontSize.lg}
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.primary}
            >
              ${booking.totalPrice.toFixed(2)}
            </CustomText>
          </View>
        </View>
      </ScrollView>

      {/* Booking Actions */}
      <View style={styles.actionsContainer}>
        {booking.status === 'PENDING' && (
          <>
            <View style={[styles.actionButton, styles.actionButtonLeft]}>
              <CustomButton
                title="Accept"
                onPress={() => setShowAcceptConfirm(true)}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
                buttonStyle={styles.actionButtonInner}
              />
            </View>
            <View style={[styles.actionButton, styles.actionButtonRight]}>
              <CustomButton
                title="Reject"
                onPress={() => setShowRejectConfirm(true)}
                backgroundColor={theme.colors.red}
                textColor={theme.colors.white}
                buttonStyle={styles.actionButtonInner}
              />
            </View>
          </>
        )}
        {booking.status === 'ACCEPTED' && (
          <>
            <View style={[styles.actionButton, styles.actionButtonLeft]}>
              <CustomButton
                title="Cancel Booking"
                onPress={() => setShowCancelConfirm(true)}
                backgroundColor={theme.colors.red}
                textColor={theme.colors.white}
                buttonStyle={styles.actionButtonInner}
              />
            </View>
            <View style={[styles.actionButton, styles.actionButtonRight]}>
              <CustomButton
                title="Reschedule"
                onPress={handleReschedulePress}
                backgroundColor={theme.colors.primary_light}
                textColor={theme.colors.white}
                buttonStyle={styles.actionButtonInner}
              />
            </View>
          </>
        )}
      </View>

      {/* Modals */}
      <RescheduleModal
        visible={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleReschedule}
        currentDate={booking.bookingDate}
        currentTime={booking.timeSlot}
      />

      <ReasonInputModal
        visible={showReasonModal}
        onClose={() => {
          setShowReasonModal(false);
          setSelectedServiceId(null);
          setPendingMember(null);
        }}
        onSubmit={handleMemberChangeWithReason}
      />

      <MemberSelectionModal
        visible={showMemberSelectionModal}
        onClose={() => {
          setShowMemberSelectionModal(false);
          setSelectedServiceId(null);
        }}
        onSelect={handleMemberSelect}
        serviceName={booking.services.find(s => s.id === selectedServiceId)?.name}
        currentMemberId={booking.services.find(s => s.id === selectedServiceId)?.assignedMember?.id}
      />

      {/* Confirmation Dialogs */}
      <SweetAlert
        visible={showAcceptConfirm}
        message="Are you sure you want to accept this booking?"
        isConfirmType="confirm"
        onOk={handleAccept}
        onCancel={() => setShowAcceptConfirm(false)}
      />

      <SweetAlert
        visible={showRejectConfirm}
        message="Are you sure you want to reject this booking?"
        isConfirmType="delete"
        onOk={handleReject}
        onCancel={() => setShowRejectConfirm(false)}
      />

      <SweetAlert
        visible={showCancelConfirm}
        message="Are you sure you want to cancel this booking?"
        isConfirmType="delete"
        onOk={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(16),
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.SW(16),
      paddingBottom: theme.SH(100),
    },
    section: {
      marginBottom: theme.SH(16),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.SH(12),
    },
    bookingIdContainer: {
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: theme.SW(12),
      paddingVertical: theme.SH(6),
      borderRadius: theme.borderRadius.md,
      alignSelf: 'flex-start',
    },
    customerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    callButton: {
      width: theme.SF(40),
      height: theme.SF(40),
      borderRadius: theme.SF(20),
      backgroundColor: theme.colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      marginBottom: theme.SH(16),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(12),
    },
    detailText: {
      marginLeft: theme.SW(12),
      flex: 1,
    },
    addressContainer: {
      flex: 1,
      marginLeft: theme.SW(12),
    },
    notesContainer: {
      marginTop: theme.SH(8),
      padding: theme.SW(12),
      backgroundColor: theme.colors.secondary,
      borderRadius: theme.borderRadius.md,
    },
    rescheduleButton: {
      borderRadius: theme.borderRadius.md,
    },
    rescheduleButtonText: {
      fontSize: theme.fontSize.sm,
    },
    serviceDivider: {
      height: 1,
      backgroundColor: theme.colors.gray,
      marginVertical: theme.SH(16),
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.SH(16),
      paddingTop: theme.SH(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray,
    },
    actionsContainer: {
      flexDirection: 'row',
      padding: theme.SW(16),
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray,
      paddingBottom: theme.SH(20),
    },
    actionButton: {
      flex: 1,
    },
    actionButtonLeft: {
      marginRight: theme.SW(8),
    },
    actionButtonRight: {
      marginLeft: theme.SW(8),
    },
    actionButtonInner: {
      borderRadius: theme.borderRadius.md,
    },
  });
