import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Container, AppHeader, CustomText, CustomButton, LoadingComp } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RescheduleModal from '@components/booking/RescheduleModal';
import ReasonInputModal from '@components/booking/ReasonInputModal';
import {
  ServiceSummeryCard,
  BookingHeader,
  ProviderDetailsCard,
  OtherPersonDetailsCard,
  BookingForCard,
  DateTimeCard,
  AddressCard,
} from '@components';
import MemberSelectionModal, { Member } from '@components/booking/MemberSelectionModal';
import { SweetAlert } from '@components/common';
import { useGetBookingDetail } from '@services/api/queries/appQueries';
import { handleApiError } from '@utils/apiHelpers';

type BookingStatus = 'PENDING' | 'ACCEPTED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';

// Map API booking status to UI status
const mapBookingStatus = (status: string): BookingStatus => {
  const statusMap: Record<string, BookingStatus> = {
    'requested': 'PENDING',
    'pending': 'PENDING',
    'accepted': 'ACCEPTED',
    'ongoing': 'ACCEPTED',
    'rescheduled': 'RESCHEDULED',
    'cancelled': 'CANCELLED',
    'completed': 'COMPLETED',
  };
  return statusMap[status?.toLowerCase()] || 'PENDING';
};

// Format date from API format (YYYY-MM-DD) to display format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

// Format address from booking
const formatBookingAddress = (booking: any): string => {
  if (!booking?.addressId) return '';
  
  const address = booking?.addressId;
  const parts = [
    address?.line1,
    address?.line2,
    address?.landmark,
    address?.pincode,
  ].filter(Boolean);
  
  return parts.join(', ') || '';
};

export default function BookingDetail() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Get booking ID from route params
  const bookingId = route.params?.bookingId || route.params?.booking?.id || route.params?.booking?.bookingId;

  // Fetch booking details from API
  const {
    data: bookingDetailData,
    isLoading: isLoadingBooking,
    isError: isErrorBooking,
    error: bookingError,
    refetch: refetchBooking,
  } = useGetBookingDetail(bookingId);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showMemberSelectionModal, setShowMemberSelectionModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [pendingMember, setPendingMember] = useState<Member | null>(null);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Transform API booking data to component format
  const booking = useMemo(() => {
    if (!bookingDetailData?.ResponseData?.booking) return null;

    const apiBooking = bookingDetailData?.ResponseData?.booking;
    const bookedServices = bookingDetailData?.ResponseData?.bookedServices || [];
    
    // Get reference arrays from booking object
    const servicesArray = apiBooking?.services || [];
    const addOnServicesArray = apiBooking?.addOnServices || [];
    const promotionOffersArray = apiBooking?.promotionOffers || [];
    const assignedMembersArray = apiBooking?.assignedMembers || [];
    
    // Transform bookedServices to ServiceSummeryCard format
    const services = bookedServices.map((bookedService: any) => {
      // Find service by ID
      const serviceId = bookedService?.serviceId;
      const service = typeof serviceId === 'string' 
        ? servicesArray.find((s: any) => s?._id === serviceId)
        : serviceId;
      
      // Find add-ons by IDs
      const addOnIds = bookedService?.addOnServices || [];
      const selectedAddOns = Array.isArray(addOnIds)
        ? addOnIds
            .map((id: string) => addOnServicesArray.find((addon: any) => addon?._id === id))
            .filter((addon: any) => addon !== undefined)
        : [];
      
      // Find promotion offer by ID
      const promotionOfferId = bookedService?.promotionOfferId;
      const appliedOffer = promotionOfferId
        ? promotionOffersArray.find((offer: any) => offer?._id === promotionOfferId)
        : null;
      
      // Find assigned member if exists
      const assignedMember = bookedService?.assignedMember
        ? assignedMembersArray.find((member: any) => member?._id === bookedService?.assignedMember)
        : undefined;

      return {
        _id: service?._id || bookedService?._id,
        name: service?.name || 'Service',
        price: service?.price || 0,
        time: service?.time || 0,
        images: service?.images || [],
        selectedAddOns: selectedAddOns,
        appliedOffer: appliedOffer || null,
        discountAmount: bookedService?.promotionOfferAmount || 0,
        assignedMember: assignedMember ? {
          id: assignedMember?._id || assignedMember?.id,
          name: assignedMember?.name,
          avatar: assignedMember?.avatar || assignedMember?.profileImage,
          phone: assignedMember?.phone || assignedMember?.contact,
        } : undefined,
      };
    });

    return {
      id: apiBooking?._id,
      bookingId: apiBooking?._id,
      status: mapBookingStatus(apiBooking?.bookingStatus),
      providerName: apiBooking?.spId?.name || 'Provider',
      providerPhone: apiBooking?.spId?.contact || '',
      providerImage: apiBooking?.spId?.profileImage,
      serviceAddress: formatBookingAddress(apiBooking),
      bookingDate: formatDate(apiBooking?.date),
      timeSlot: apiBooking?.time || '',
      services: services,
      totalPrice: apiBooking?.discountedAmount || apiBooking?.totalAmount || 0,
      originalPrice: apiBooking?.totalAmount || 0,
      discountAmount: apiBooking?.promotionOfferAmount || 0,
      paymentType: apiBooking?.paymentType,
      paymentStatus: apiBooking?.paymentStatus,
      bookedFor: apiBooking?.bookedFor,
      bookedForDetails: apiBooking?.bookedForDetails,
      providerData: apiBooking?.spId,
      preferences: apiBooking?.preferences || [],
      spBusinessProfile: apiBooking?.spBusinessProfile,
    };
  }, [bookingDetailData]);

  // Handle API errors - show error toast but don't block UI if we have cached data
  useEffect(() => {
    if (isErrorBooking && bookingError && !bookingDetailData?.ResponseData) {
      handleApiError(bookingError);
    }
  }, [isErrorBooking, bookingError, bookingDetailData]);

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
    setShowAcceptConfirm(false);
    // TODO: API call to accept booking
    refetchBooking();
  }, [refetchBooking]);

  const handleReject = useCallback(() => {
    setShowRejectConfirm(false);
    // TODO: API call to reject booking
    refetchBooking();
  }, [refetchBooking]);

  const handleCancel = useCallback(() => {
    setShowCancelConfirm(false);
    // TODO: API call to cancel booking
    refetchBooking();
  }, [refetchBooking]);

  const handleReschedule = useCallback((_newDate: string, _newTime: string) => {
    // TODO: API call to reschedule
    setShowRescheduleModal(false);
    // Refetch booking to get updated data
    refetchBooking();
  }, [refetchBooking]);

  const handleAssignMember = useCallback((service: any) => {
    setSelectedServiceId(service?._id);
    setShowMemberSelectionModal(true);
  }, []);

  const handleCallMember = useCallback((phone: string) => {
    const url = `tel:${phone}`;
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


  const handleMemberSelect = useCallback((member: Member) => {
    if (selectedServiceId && booking) {
      const service = booking?.services?.find((s: any) => s?._id === selectedServiceId);
      const isChangingMember = service?.assignedMember !== undefined;

      if (isChangingMember && service?.assignedMember?.id !== member.id) {
        // If changing member, show reason modal first
        setPendingMember(member);
        setShowMemberSelectionModal(false);
        setShowReasonModal(true);
      } else {
        // Direct assignment (new member or same member)
        // Update local state - TODO: API call to assign member to service
        setShowMemberSelectionModal(false);
        setSelectedServiceId(null);
        // Refetch booking to get updated data
        refetchBooking();
      }
    }
  }, [selectedServiceId, booking, refetchBooking]);

  const handleMemberChangeWithReason = useCallback((_reason: string) => {
    if (selectedServiceId && pendingMember) {
      // TODO: API call to change member with reason
      setPendingMember(null);
      setShowReasonModal(false);
      setSelectedServiceId(null);
      // Refetch booking to get updated data
      refetchBooking();
    }
  }, [selectedServiceId, pendingMember, refetchBooking]);

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

      {isLoadingBooking && !bookingDetailData ? (
        <View style={styles.loadingContainer}>
          <LoadingComp visible={true} />
        </View>
      ) : isErrorBooking && !bookingDetailData ? (
        <View style={styles.emptyContainer}>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.gray || '#666666'}
            textAlign="center"
          >
            Details not found
          </CustomText>
        </View>
      ) : !booking ? (
        <View style={styles.emptyContainer}>
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.gray || '#666666'}
            textAlign="center"
          >
            Booking not found
          </CustomText>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Booking Header */}
          <BookingHeader
            bookingId={booking.bookingId}
            status={booking.status}
            statusColor={getStatusColor(booking.status)}
          />

          {/* Provider Details Card */}
          <ProviderDetailsCard
            providerName={booking?.providerName}
            providerPhone={booking?.providerPhone}
            providerImage={booking?.providerImage}
            onCall={handleCall}
          />

          {/* Booking For Card */}
          <BookingForCard bookedFor={booking?.bookedFor} />

          {/* Other Person Details - Show only if bookedFor is 'other' */}
          {booking?.bookedFor === 'other' && booking?.bookedForDetails && (
            <OtherPersonDetailsCard
              name={booking?.bookedForDetails?.name || ''}
              email={booking?.bookedForDetails?.email || ''}
              contact={booking?.bookedForDetails?.contact || ''}
              onCall={handleCall}
            />
          )}

          {/* Address Card - Show only if address exists */}
          {
            booking.preferences.length > 0 && booking.preferences.includes('atHome') && (
              <AddressCard
                address={booking.serviceAddress}
                onViewLocation={() => handleOpenMaps(booking.serviceAddress)}
              />
            )
          }

          {/* Date & Time Card */}
          <DateTimeCard
            date={booking?.bookingDate || ''}
            time={booking?.timeSlot || ''}
            onReschedule={handleReschedulePress}
          />

          {/* Services List using ServiceSummeryCard */}
          <View style={styles.card}>
            <View style={styles.titleContainer}>
              <CustomText
                fontSize={theme.fontSize.md}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.text}
              >
                Services
              </CustomText>
            </View>
            <ServiceSummeryCard
              pageName={'booking-detail'}
              services={booking?.services || []}
              onAssignMember={handleAssignMember}
              onCallMember={handleCallMember}
              onAddAddOns={(service) => {
                // TODO: Navigate to add addons screen
                console.log('Add addons for service:', service);
              }}
            />
            <View style={styles.totalContainer}>
              <View>
                {(booking?.discountAmount || 0) > 0 && (
                  <CustomText
                    fontSize={theme.fontSize.xs}
                    fontFamily={theme.fonts.REGULAR}
                    color={theme.colors.lightText}
                    style={styles.originalPriceText}
                  >
                    Original: ${(booking?.originalPrice || 0).toFixed(2)}
                  </CustomText>
                )}
                <CustomText
                  fontSize={theme.fontSize.md}
                  fontFamily={theme.fonts.SEMI_BOLD}
                  color={theme.colors.text}
                >
                  Total
                </CustomText>
              </View>
              <CustomText
                fontSize={theme.fontSize.lg}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.primary}
              >
                ${(booking?.totalPrice || 0).toFixed(2)}
              </CustomText>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Booking Actions */}
      {booking && (
        <View style={styles.actionsContainer}>
          {booking?.status === 'PENDING' && (
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
      )}

      {/* Modals */}
      {booking && (
        <>
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
            serviceName={booking?.services?.find((s: any) => s?._id === selectedServiceId)?.name}
            currentMemberId={booking?.services?.find((s: any) => s?._id === selectedServiceId)?.assignedMember?.id}
          />
        </>
      )}

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
    titleContainer: {
      paddingHorizontal: theme.SW(20),
      marginBottom: theme.SH(12),
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.SW(16),
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
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.SH(16),
      paddingTop: theme.SH(16),
      // borderTopWidth: 1,
      paddingHorizontal: theme.SW(20),
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.SH(100),
      paddingHorizontal: theme.SW(20),
    },
    originalPriceText: {
      textDecorationLine: 'line-through',
      marginBottom: theme.SH(2),
    },
  });
