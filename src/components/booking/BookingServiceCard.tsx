import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, CustomButton } from '@components/common';
import imagePaths from '@assets';
import { getStatusColor, mapBookingStatusToDisplay } from '@utils/tools';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { navigate } from '@utils/NavigationUtils';

type Service = {
  _id: string;
  serviceId?: any;
  name: string;
  images?: string[];
  selectedAddOns?: any[];
  appliedOffer?: any;
  discountAmount?: number;
  price?: number;
  totalAmount?: number;
  discountedAmount?: number;
  promotionOfferAmount?: number;
  addOnsTotal?: number;
  bookingStatus?: string;
  assignedMember?: any;
};

type BookingServiceCardProps = {
  services: any[];
  onCancelService?: (serviceId: string) => void;
  onAssignMember?: (service: Service, isChangingMember: boolean) => void;
  onCallMember?: (phone: string) => void;
  pageName?: string;
  onAddAddOns?: (service: Service) => void;
  onReschedule?: (service: Service) => void;
  mainBookingStatus?: string;
  onAcceptService?: (bookedServiceId: string) => void;
  onRejectService?: (bookedServiceId: string) => void;
  serviceLoadingStates?: Record<string, 'accept' | 'reject' | null>;
};

export default function BookingServiceCard({
  services,
  onCallMember: _onCallMember,
  // pageName = '',
  onCancelService,
  onAddAddOns: _onAddAddOns,
  onReschedule,
  mainBookingStatus,
  onAcceptService,
  serviceLoadingStates,
}: BookingServiceCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  console.log('mainBookingStatus-----BookingServiceCard', mainBookingStatus);
  // Check if actions should be disabled based on main booking status

  const safeServices = Array.isArray(services) ? services : [];

  return (
    <View style={styles.section}>
      {safeServices.map((service, index) => {
        if (service == null) return null;
        const serviceImage = service?.images?.[0]
          ? { uri: service?.images?.[0] }
          : imagePaths.no_image;
        const serviceStatus = service?.bookingStatus;
        const assignedMember = service?.assignedMember || null;
        const mappedServiceStatus = mapBookingStatusToDisplay(serviceStatus);
        const serviceStatusColor = getStatusColor(serviceStatus);
        const appliedOffer = service?.appliedOffer;
        console.log(
          'serviceStatusColor-----serviceStatusColor',
          serviceStatusColor,
        );
        console.log(
          'mappedServiceStatus-----mappedServiceStatus',
          mappedServiceStatus,
        );
        console.log('serviceStatus-----BookingServiceCard', serviceStatus);
        console.log('assignedMember-----BookingServiceCard', assignedMember);
        return (
          <View
            key={service._id ?? `service-${index}`}
            style={styles.serviceCard}
          >
            <View style={styles.serviceInfo}>
              <View style={styles.serviceImageContainer}>
                <ImageLoader
                  source={serviceImage}
                  mainImageStyle={styles.serviceImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.serviceDetails}>
                <CustomText style={styles.serviceName}>
                  {service?.name}
                </CustomText>
              </View>
            </View>

            {/* Cancelled Status Messages */}
            {serviceStatus === 'cancelledBySp' && (
              <CustomText
                color={serviceStatusColor}
                fontFamily={theme.fonts.MEDIUM}
                fontSize={theme.fontSize.sm}
                style={styles.statusText}
              >
                Cancelled by provider
              </CustomText>
            )}
            {serviceStatus === 'cancelledByCustomer' && (
              <CustomText
                color={serviceStatusColor}
                fontFamily={theme.fonts.MEDIUM}
                fontSize={theme.fontSize.sm}
                style={styles.statusText}
              >
                Cancelled by customer
              </CustomText>
            )}
            {serviceStatus === 'rejected' && (
              <CustomText
                color={serviceStatusColor}
                fontFamily={theme.fonts.MEDIUM}
                fontSize={theme.fontSize.sm}
                style={styles.statusText}
              >
                Rejected by provider
              </CustomText>
            )}
            {/* {serviceStatus === 'rescheduledByCustomer' && (
                            <CustomText color={serviceStatusColor} fontFamily={theme.fonts.MEDIUM} fontSize={theme.fontSize.sm} style={styles.statusText}>
                                Rescheduled by customer <CustomText color={theme.colors.text} fontFamily={theme.fonts.MEDIUM} fontSize={theme.fontSize.xs}>(Wait for approval)</CustomText>
                            </CustomText>
                        )} */}
            {serviceStatus === 'rescheduledByCustomer' && (
              <>
                <CustomText
                  color={serviceStatusColor}
                  fontFamily={theme.fonts.MEDIUM}
                  fontSize={theme.fontSize.sm}
                  style={{ marginTop: theme.SH(8), marginBottom: theme.SH(4) }}
                >
                  Rescheduled by you, Please wait for provider approval{' '}
                  <CustomText
                    style={{
                      marginTop: theme.SH(8),
                      marginBottom: theme.SH(4),
                    }}
                  >
                    {' '}
                    <CustomText
                      color={theme.colors.primary}
                      fontFamily={theme.fonts.MEDIUM}
                      fontSize={theme.fontSize.xs}
                    >
                      {service?.rescheduleDate},
                    </CustomText>{' '}
                    <CustomText
                      color={theme.colors.primary}
                      fontFamily={theme.fonts.MEDIUM}
                      fontSize={theme.fontSize.xs}
                    >
                      {service?.rescheduleTime}
                    </CustomText>
                  </CustomText>
                </CustomText>
              </>
            )}
            {serviceStatus === 'rescheduledBySp' && (
              <>
                <CustomText
                  color={serviceStatusColor}
                  fontFamily={theme.fonts.MEDIUM}
                  fontSize={theme.fontSize.sm}
                  style={{ marginTop: theme.SH(8), marginBottom: theme.SH(4) }}
                >
                  Rescheduled by service provider :{' '}
                  <CustomText
                    style={{
                      marginTop: theme.SH(8),
                      marginBottom: theme.SH(4),
                    }}
                  >
                    {' '}
                    <CustomText
                      color={theme.colors.primary}
                      fontFamily={theme.fonts.MEDIUM}
                      fontSize={theme.fontSize.xs}
                    >
                      {service?.rescheduleDate},
                    </CustomText>{' '}
                    <CustomText
                      color={theme.colors.primary}
                      fontFamily={theme.fonts.MEDIUM}
                      fontSize={theme.fontSize.xs}
                    >
                      {service?.rescheduleTime}
                    </CustomText>
                  </CustomText>
                </CustomText>
              </>
            )}
            {serviceStatus !== 'rescheduledByCustomer' &&
              serviceStatus !== 'rescheduledBySp' &&
              service?.rescheduleTime &&
              service?.rescheduleDate && (
                <CustomText
                  style={{ marginTop: theme.SH(8), marginBottom: theme.SH(4) }}
                >
                  {' '}
                  <CustomText
                    color={theme.colors.primary}
                    fontFamily={theme.fonts.MEDIUM}
                    fontSize={theme.fontSize.xs}
                  >
                    {service?.rescheduleDate},
                  </CustomText>{' '}
                  <CustomText
                    color={theme.colors.primary}
                    fontFamily={theme.fonts.MEDIUM}
                    fontSize={theme.fontSize.xs}
                  >
                    {service?.rescheduleTime}
                  </CustomText>
                </CustomText>
              )}
            {serviceStatus === 'rescheduledByCustomer' && (
              <>
                <CustomText
                  color={theme.colors.text}
                  fontFamily={theme.fonts.MEDIUM}
                  fontSize={theme.fontSize.sm}
                  style={{ marginBottom: theme.SH(4) }}
                >
                  Rescheduled reason:{' '}
                  <CustomText
                    color={theme.colors.text}
                    fontFamily={theme.fonts.REGULAR}
                    fontSize={theme.fontSize.xs}
                  >
                    {service?.rescheduleReason}
                  </CustomText>
                </CustomText>
              </>
            )}

            {/* Applied Offer */}
            {appliedOffer && (
              <View style={styles.appliedOfferContainer}>
                <View style={styles.appliedOfferContent}>
                  <View style={styles.appliedOfferInfo}>
                    <CustomText style={styles.appliedOfferTitle}>
                      {appliedOffer?.title ?? ''} (
                      {appliedOffer?.discountValue ?? 0}% Off)
                    </CustomText>
                    {/* {(Number(service?.discountAmount) || 0) > 0 && (
                                            <CustomText style={styles.appliedDiscountAmount}>
                                                Discount: ${(Number.isFinite(service?.discountAmount) ? service.discountAmount : 0).toFixed(2)}
                                            </CustomText>
                                        )} */}
                  </View>
                </View>
              </View>
            )}

            {/* Selected Add-ons (with discount % when applicable) */}
            {service.selectedAddOns && service.selectedAddOns.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.addOnsContainer}>
                  {service.selectedAddOns
                    .filter((addOn: any) => addOn != null)
                    .map((addOn: any, index: number) => {
                      const addOnPrice = Number(addOn?.price) || 0;
                      const discountPct = Math.min(
                        100,
                        Math.max(0, Number(addOn?.discountPercentage) || 0),
                      );
                      // const discounted = addOnPrice * (1 - discountPct / 100);
                      // const cutPrice = Number.isFinite(discounted) ? discounted : addOnPrice;
                      // const hasDiscount = discountPct > 0;
                      const displayOriginal = (
                        Number.isFinite(addOnPrice) ? addOnPrice : 0
                      ).toFixed(2);
                      // const displayCut = (Number.isFinite(cutPrice) ? cutPrice : addOnPrice).toFixed(2);
                      return (
                        <View
                          key={addOn._id ?? `addon-${index}`}
                          style={styles.addOnTag}
                        >
                          <CustomText style={styles.addOnTagText}>
                            {addOn?.name ?? ''}: ${displayOriginal}
                            {discountPct ? ` (${discountPct}% Off)` : ''}
                            {/* {hasDiscount ? ` → $${displayCut} (${discountPct}% off)` : ''} */}
                          </CustomText>
                        </View>
                      );
                    })}
                </View>
              </>
            )}

            {/* Price Summary */}
            <View style={styles.divider} />
            <View style={styles.priceSummaryContainer}>
              {service.price !== undefined && (
                <View style={styles.priceRow}>
                  <CustomText style={styles.priceLabel}>Service:</CustomText>
                  <CustomText style={styles.priceValue}>
                    $
                    {(Number.isFinite(service?.price)
                      ? service.price
                      : 0
                    ).toFixed(2)}
                  </CustomText>
                </View>
              )}
              {service.addOnsTotal !== undefined && service.addOnsTotal > 0 && (
                <View style={styles.priceRow}>
                  <CustomText style={styles.priceLabel}>Add-ons:</CustomText>
                  <CustomText style={styles.priceValue}>
                    $
                    {(Number.isFinite(service?.addOnsTotal)
                      ? service.addOnsTotal
                      : 0
                    ).toFixed(2)}
                  </CustomText>
                </View>
              )}
              {service.totalAmount !== undefined && (
                <View style={styles.priceRow}>
                  <CustomText style={styles.priceLabel}>Subtotal:</CustomText>
                  <CustomText style={styles.priceValue}>
                    $
                    {(Number.isFinite(service?.totalAmount)
                      ? service.totalAmount
                      : 0
                    ).toFixed(2)}
                  </CustomText>
                </View>
              )}
              {service.discountAmount !== undefined &&
                service.discountAmount > 0 && (
                  <View style={styles.priceRow}>
                    <CustomText style={styles.priceLabel}>Discount:</CustomText>
                    <CustomText
                      style={[styles.priceValue, styles.discountText]}
                    >
                      -$
                      {(Number.isFinite(service?.discountAmount)
                        ? service.discountAmount
                        : 0
                      ).toFixed(2)}
                    </CustomText>
                  </View>
                )}
              {service.discountedAmount !== undefined && (
                <View style={[styles.priceRow, styles.totalPriceRow]}>
                  <CustomText style={styles.totalPriceLabel}>Total:</CustomText>
                  <CustomText style={styles.totalPriceValue}>
                    $
                    {(Number.isFinite(service?.discountedAmount)
                      ? service.discountedAmount
                      : 0
                    ).toFixed(2)}
                  </CustomText>
                </View>
              )}
            </View>
            
            {/* Member Assignment Section */}

            <View style={styles.memberSection}>
              {assignedMember && (
                <>
                  <CustomText
                    color={theme.colors.text}
                    fontFamily={theme.fonts.MEDIUM}
                    fontSize={theme.fontSize.sm}
                    style={styles.assignedMemberText}
                  >
                    Assigned Member
                  </CustomText>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberRow}>
                      <View style={styles.avatarContainer}>
                        <ImageLoader
                          source={
                            assignedMember?.profileImage
                              ? { uri: assignedMember.profileImage }
                              : imagePaths.no_image
                          }
                          mainImageStyle={styles.avatar}
                          resizeMode="cover"
                          fallbackImage={imagePaths.no_image}
                        />
                      </View>
                      <View style={styles.memberDetails}>
                        <CustomText
                          fontSize={theme.fontSize.sm}
                          fontFamily={theme.fonts.MEDIUM}
                          color={theme.colors.text}
                        >
                          {assignedMember?.name}
                        </CustomText>
                        {assignedMember?.contact && (
                          <CustomText
                            fontSize={theme.fontSize.xs}
                            color={theme.colors.lightText}
                          >
                            {assignedMember.contact}
                          </CustomText>
                        )}
                      </View>
                    </View>
                  </View>
                </>
              )}

              {/* {(serviceStatus === 'accepted' || serviceStatus === 'requested') && ( */}
              <View style={styles.serviceActionContainer}>
                {serviceStatus === 'rescheduledBySp' && (
                  <View style={styles.serviceActionButtonWrap}>
                    <CustomButton
                      title="Accept Reschedule"
                      onPress={() => onAcceptService?.(service._id)}
                      isLoading={serviceLoadingStates?.[service._id] === 'accept'}
                      disable={serviceLoadingStates?.[service._id] === 'accept'}
                      backgroundColor={theme.colors.primary}
                      textColor={theme.colors.white}
                      buttonStyle={styles.rescheduleButton}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  </View>
                )}
                {(serviceStatus === 'accepted' ||
                  serviceStatus === 'rescheduledByCustomer' ||
                  serviceStatus === 'rescheduledBySp') && (
                  <View style={styles.serviceActionButtonWrap}>
                    <CustomButton
                      title="Reschedule"
                      onPress={() => onReschedule?.(service)}
                      backgroundColor={theme.colors.primary}
                      textColor={theme.colors.white}
                      buttonStyle={styles.rescheduleButton}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  </View>
                )}
                {(serviceStatus === 'rescheduledByCustomer' ||
                  serviceStatus === 'rescheduledBySp' ||
                  serviceStatus === 'accepted') && (
                  <View style={styles.serviceActionButtonWrap}>
                    <CustomButton
                      title="Cancel Service"
                      onPress={() => onCancelService?.(service._id)}
                      backgroundColor={theme.colors.red}
                      textColor={theme.colors.white}
                      buttonStyle={styles.cancelServiceButton}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  
                  </View>
                )}
              </View>
              {/* )} */}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  return StyleSheet.create({
    section: {
      // paddingHorizontal: SW(20),
      paddingVertical: SH(20),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(16),
    },
    serviceCard: {
      padding: SW(12),
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(8),
      marginBottom: SH(8),
    },
    serviceInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    serviceDetails: {
      marginLeft: SW(12),
      flex: 1,
    },
    serviceName: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(2),
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    servicePrice: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
      marginBottom: SH(8),
    },
    originalPrice: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || Colors.text,
      textDecorationLine: 'line-through',
      marginBottom: SH(2),
    },
    addOnsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SW(8),
      marginTop: SH(4),
    },
    addOnTag: {
      backgroundColor: Colors.secondary || '#E3F2FD',
      paddingHorizontal: SW(8),
      paddingVertical: SH(4),
      borderRadius: SF(4),
    },
    addOnTagText: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.primary,
    },
    serviceImageContainer: {
      width: SW(40),
      height: SH(40),
      borderRadius: SF(20),
      overflow: 'hidden',
    },
    serviceImage: {
      width: '100%',
      height: '100%',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.gray,
      marginVertical: theme.SH(8),
    },
    cancelServiceButton: {
      borderRadius: SF(8),
      paddingVertical: SH(8),
      backgroundColor: Colors.red || '#F44336',
      // marginTop: SH(8),
    },
    offersContainer: {
      marginTop: SH(8),
      gap: SH(8),
    },
    offerItem: {
      backgroundColor: Colors.secondary || '#E3F2FD',
      paddingHorizontal: SW(12),
      paddingVertical: SH(10),
      borderRadius: SF(6),
    },
    offerContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(10),
    },
    offerInfo: {
      flex: 1,
    },
    offerTitle: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
      marginBottom: SH(4),
    },
    discountAmount: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    appliedOfferContainer: {
      marginTop: SH(8),
      backgroundColor: '#E8F5E9',
      paddingHorizontal: SW(12),
      paddingVertical: SH(10),
      borderRadius: SF(6),
      borderWidth: 1,
      borderColor: '#34eb37',
    },
    appliedOfferContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SW(10),
    },
    appliedOfferInfo: {
      flex: 1,
    },
    appliedOfferTitle: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: '#34eb37',
      marginBottom: SH(4),
    },
    appliedDiscountAmount: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    priceSummaryContainer: {
      marginTop: SH(8),
      paddingTop: SH(8),
    },
    priceLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || Colors.text,
      flex: 1,
    },
    priceValue: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    discountText: {
      color: '#4CAF50',
    },
    totalPriceRow: {
      marginTop: SH(8),
      paddingTop: SH(8),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    totalPriceLabel: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      flex: 1,
    },
    totalPriceValue: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    memberSection: {
      marginTop: SH(12),
      paddingTop: SH(12),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    memberInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SH(12),
    },
    avatarContainer: {
      width: SW(40),
      height: SH(40),
      borderRadius: SF(20),
      overflow: 'hidden',
      backgroundColor: Colors.gray || '#F5F5F5',
      marginRight: SW(12),
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    memberDetails: {
      flex: 1,
    },
    callButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SH(4),
      gap: SW(4),
    },
    callButtonText: {
      marginLeft: SW(4),
    },
    assignMemberButton: {
      borderRadius: SF(8),
      paddingVertical: SH(8),
    },

    assignMemberButtonText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
    },
    changeMemberButton: {
      borderRadius: SF(8),
      paddingVertical: SH(8),
    },
    changeMemberButtonText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
    },
    addOnsActionContainer: {
      marginTop: SH(8),
    },
    addAddOnsButton: {
      borderRadius: SF(8),
      paddingVertical: SH(8),
      backgroundColor: Colors.secondary || '#E3F2FD',
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    addAddOnsButtonText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    assignedMemberText: {
      marginBottom: SH(8),
    },
    statusText: {
      marginTop: SH(8),
      marginBottom: SH(4),
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(12),
      flex: 1,
    },

    rescheduleButton: {
      borderRadius: SF(8),
      paddingVertical: SH(8),
      backgroundColor: Colors.primary_light,
      borderWidth: 1,
      borderColor: Colors.primary,
      // marginBottom: SH(8),
    },
    rescheduleButtonText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.white,
    },
    serviceActionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: SW(8),
      marginTop: SH(8),
    },
    serviceActionButtonWrap: {
      flexShrink: 0,
      marginBottom: SH(8),
    },
    cancelPolicyText: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      marginTop: SH(8),
      textDecorationLine: 'underline',
      color: Colors.primary,
    },
  });
};
