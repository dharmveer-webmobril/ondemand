import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, CustomButton, LoadingComp } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RescheduleModal from '@components/booking/RescheduleModal';
import ReasonInputModal from '@components/booking/ReasonInputModal';
import CancelBookingModal from '@components/booking/CancelBookingModal';
import {
  BookingHeader,
  ProviderDetailsCard,
  OtherPersonDetailsCard,
  BookingForCard,
  DateTimeCard,
  AddressCard,
  BookingServiceCard,
} from '@components';
import MemberSelectionModal, { Member } from '@components/booking/MemberSelectionModal';
import { SweetAlert } from '@components/common';
import {
  useGetBookingDetail,
  useCancelBooking,
  useCancelService,
  useRescheduleService,
} from '@services/api/queries/appQueries';
import { handleApiError, handleSuccessToast } from '@utils/apiHelpers';
import { getStatusLabel, getStatusColor } from '@utils/tools';


// Map API booking status to UI status


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
  const { t } = useTranslation();
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

  // Common loader type state
  type LoaderType = 'none' | 'cancelBooking' | 'cancelService' | 'rescheduleService';
  const [loaderType, setLoaderType] = useState<LoaderType>('none');

  // Cancel booking mutation
  const {
    mutate: cancelBooking,
    isPending: isCancelingBooking,
  } = useCancelBooking();

  // Cancel service mutation
  const {
    mutate: cancelService,
    isPending: isCancelingService,
  } = useCancelService();

  // Reschedule service mutation
  const {
    mutate: rescheduleService,
    isPending: isReschedulingService,
  } = useRescheduleService();

  // Update loader type based on mutation states
  React.useEffect(() => {
    if (isCancelingBooking) {
      setLoaderType('cancelBooking');
    } else if (isCancelingService) {
      setLoaderType('cancelService');
    } else if (isReschedulingService) {
      setLoaderType('rescheduleService');
    } else {
      setLoaderType('none');
    }
  }, [isCancelingBooking, isCancelingService, isReschedulingService]);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showMemberSelectionModal, setShowMemberSelectionModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [pendingMember, setPendingMember] = useState<Member | null>(null);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelServiceModal, setShowCancelServiceModal] = useState(false);
  const [cancelType, setCancelType] = useState<'booking' | 'service'>('booking');
  const [serviceToCancel, setServiceToCancel] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Transform API booking data to component format
  const booking = useMemo(() => {
    if (!bookingDetailData?.ResponseData?.booking) return null;

    const apiBooking = bookingDetailData?.ResponseData?.booking;
    const bookedServices = bookingDetailData?.ResponseData?.bookedServices || [];

    // Transform bookedServices to BookingServiceCard format
    const services = bookedServices.map((bookedService: any) => {
      // Find service by ID (serviceId is a string ID)
      // serviceId is already a full object in the new structure
      const service = bookedService?.serviceId || {};

      // addOnServices is already an array of full objects
      const selectedAddOns = bookedService?.addOnServices || [];

      // promotionOfferId is already a full object
      const appliedOffer = bookedService?.promotionOfferId || null;

      // assignedMemberId is already a full object
      const assignedMember = bookedService?.assignedMemberId || null;

      // Calculate service base price (from service object)
      const serviceBasePrice = service?.price || 0;

      // Get amounts from bookedService
      const serviceTotalAmount = bookedService?.totalAmount || 0; // Original total (service + addons)
      const servicePromotionOfferAmount = bookedService?.promotionOfferAmount || 0; // Discount amount
      const serviceDiscountedAmount = bookedService?.discountedAmount || 0; // Final amount after discount

      // Calculate add-ons total
      const addOnsTotal = selectedAddOns.reduce((sum: number, addon: any) => {
        return sum + (addon?.price || 0);
      }, 0);

      return {
        _id: bookedService?._id,
        serviceId: service?._id,
        name: service?.name || 'Service',
        images: service?.images || [],
        selectedAddOns: selectedAddOns,
        appliedOffer: appliedOffer,
        // Price information
        price: serviceBasePrice, // Base service price
        totalAmount: serviceTotalAmount, // Total amount (service + addons) before discount
        discountAmount: servicePromotionOfferAmount, // Discount amount applied
        discountedAmount: serviceDiscountedAmount, // Final amount after discount
        promotionOfferAmount: servicePromotionOfferAmount, // Alias for discount amount
        addOnsTotal: addOnsTotal, // Total of all add-ons
        bookingStatus: bookedService?.bookingStatus,
        assignedMember: assignedMember,
      };
    });

    return {
      customerDetails: apiBooking.bookedFor === 'other' ? apiBooking.bookedForDetails : apiBooking.customerId,
      id: apiBooking?._id,
      bookingId: apiBooking?.bookingId || apiBooking?._id,
      status: apiBooking?.bookingStatus,
      bookingStatus: apiBooking?.bookingStatus,
      originalStatus: apiBooking?.bookingStatus,
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



  const handleCall = useCallback((phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(t('common.error'), t('common.phoneNotSupported'));
        }
      })
      .catch(() => {
        Alert.alert(t('common.error'), t('common.unableToCall'));
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

  const handleCancelBookingPress = useCallback(() => {
    setCancelType('booking');
    setServiceToCancel(null);
    setShowCancelConfirm(true);
  }, []);

  const handleCancelServicePress = useCallback((serviceId: string) => {
    setCancelType('service');
    setServiceToCancel(serviceId);
    setShowCancelServiceModal(true);
  }, []);

  const handleCancelConfirm = useCallback((reason: string) => {
    if (cancelType === 'booking' && booking?.id) {
      setLoaderType('cancelBooking');
      cancelBooking(
        { bookingId: booking.id, reason },
        {
          onSuccess: (response: any) => {
            if (response?.succeeded) {
              handleSuccessToast(response?.ResponseMessage || t('bookingDetails.bookingCancelledSuccess'));
              setShowCancelConfirm(false);
              setLoaderType('none');
              refetchBooking();
            } else {
              setLoaderType('none');
              handleApiError(new Error(response?.ResponseMessage || t('bookingDetails.failedToCancelBooking')));
            }
          },
          onError: (error: any) => {
            setLoaderType('none');
            handleApiError(error);
          },
        }
      );
    } else if (cancelType === 'service' && serviceToCancel) {
      setLoaderType('cancelService');
      cancelService(
        { serviceId: serviceToCancel, reason },
        {
          onSuccess: (response: any) => {
            if (response?.succeeded) {
              handleSuccessToast(response?.ResponseMessage || t('bookingDetails.serviceCancelledSuccess'));
              setShowCancelServiceModal(false);
              setServiceToCancel(null);
              setLoaderType('none');
              refetchBooking();
            } else {
              setLoaderType('none');
              handleApiError(new Error(response?.ResponseMessage || t('bookingDetails.failedToCancelService')));
            }
          },
          onError: (error: any) => {
            setLoaderType('none');
            handleApiError(error);
          },
        }
      );
    }
  }, [cancelType, booking, serviceToCancel, cancelBooking, cancelService, refetchBooking]);

  const handleReschedule = useCallback((newDate: string, newTime: string, reason: string) => {
    if (!selectedServiceId) {
      handleApiError(new Error(t('bookingDetails.serviceIdRequired')));
      return;
    }

    setLoaderType('rescheduleService');
    rescheduleService(
      {
        serviceId: selectedServiceId,
        data: {
          date: newDate,
          time: newTime,
          reason: reason,
        },
      },
      {
        onSuccess: (response: any) => {
          if (response?.succeeded) {
            handleSuccessToast(response?.ResponseMessage || t('bookingDetails.serviceRescheduledSuccess'));
            setShowRescheduleModal(false);
            setSelectedServiceId(null);
            setLoaderType('none');
            refetchBooking();
          } else {
            setLoaderType('none');
            handleApiError(new Error(response?.ResponseMessage || t('bookingDetails.failedToRescheduleService')));
          }
        },
        onError: (error: any) => {
          setLoaderType('none');
          handleApiError(error);
        },
      }
    );
  }, [selectedServiceId, rescheduleService, refetchBooking]);

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
          Alert.alert(t('common.error'), t('common.phoneNotSupported'));
        }
      })
      .catch(() => {
        Alert.alert(t('common.error'), t('common.unableToCall'));
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

  const handleReschedulePress = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowRescheduleModal(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchBooking();
    } finally {
      setRefreshing(false);
    }
  }, [refetchBooking]);
  // console.log('booking', JSON.stringify(booking, null, 2));

  return (
    <Container safeArea={false} statusBarColor={theme.colors.white} style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('bookingDetails.headerTitle')}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary || '#135D96']}
            />
          }
        >
          {/* Booking Header */}
          <BookingHeader
            bookingId={booking?.bookingId || ''}
            status={getStatusLabel(booking?.bookingStatus) || ''}
            statusColor={getStatusColor(booking?.bookingStatus || '')}
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
            <BookingServiceCard
              pageName={'booking-detail'}
              services={booking?.services || []}
              onAssignMember={handleAssignMember}
              onCallMember={handleCallMember}
              onReschedule={(service) => {
                handleReschedulePress(service?._id);
              }}
              onCancelService={(serviceId) => {
                handleCancelServicePress(serviceId);
              }}
              mainBookingStatus={booking?.bookingStatus}
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
          {(booking.bookingStatus === 'accepted' || booking.bookingStatus === 'requested') && (
            <>
              <View style={[styles.actionButton, styles.actionButtonLeft]}>
                <CustomButton
                  title={t('bookingDetails.cancelBooking')}
                  onPress={handleCancelBookingPress}
                  backgroundColor={theme.colors.red}
                  textColor={theme.colors.white}
                  buttonStyle={styles.actionButtonInner}
                  disable={loaderType === 'cancelBooking'}
                  isLoading={loaderType === 'cancelBooking'}
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
            onClose={() => {
              setShowRescheduleModal(false);
              setSelectedServiceId(null);
            }}
            onConfirm={handleReschedule}
            currentDate={booking?.bookingDate || ''}
            currentTime={booking?.timeSlot || ''}
            spId={booking?.providerData?._id}
            isLoading={loaderType === 'rescheduleService'}
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
        message={t('bookingDetails.confirmAcceptBooking')}
        isConfirmType="confirm"
        onOk={handleAccept}
        onCancel={() => setShowAcceptConfirm(false)}
      />

      <SweetAlert
        visible={showRejectConfirm}
        message={t('bookingDetails.confirmRejectBooking')}
        isConfirmType="delete"
        onOk={handleReject}
        onCancel={() => setShowRejectConfirm(false)}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        visible={showCancelConfirm}
        onClose={() => {
          if (loaderType !== 'cancelBooking') {
            setShowCancelConfirm(false);
          }
        }}
        onSubmit={handleCancelConfirm}
        isLoading={loaderType === 'cancelBooking'}
        title={t('bookingDetails.cancelBooking')}
        message="Please provide a reason for canceling this booking (required)"
      />

      {/* Cancel Service Modal */}
      <CancelBookingModal
        visible={showCancelServiceModal}
        onClose={() => {
          if (loaderType !== 'cancelService') {
            setShowCancelServiceModal(false);
            setServiceToCancel(null);
          }
        }}
        onSubmit={handleCancelConfirm}
        isLoading={loaderType === 'cancelService'}
        title={t('bookingDetails.cancelService')}
        message="Please provide a reason for canceling this service (required)"
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
