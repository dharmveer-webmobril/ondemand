import { View, StyleSheet, Pressable } from 'react-native';
import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Colors, ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, CustomButton, VectoreIcons } from '@components/common';
import imagePaths from '@assets';
import { getStatusColor, mapBookingStatusToDisplay } from '@utils/tools';
import { SW } from '@utils/dimensions';
import { formatAmount } from '@utils/formatAmount';

type Service = {
  _id: string;
  serviceId?: any;
  name: string;
  images?: string[];
  selectedAddOns?: any[];
  postBookingAddOns?: any[];
  postBookingAddOnsTotal?: number;
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
  onTrackMember?: (service: Service) => void;
  serviceLoadingStates?: Record<string, 'accept' | 'reject' | null>;
  trackMemberLoadingId?: string | null;
  showTrackMemberButton?: boolean;
};

type AccordionRowProps = {
  styles: any;
  theme: any;
  title: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

function AccordionRow({
  styles,
  theme,
  title,
  value,
  expanded,
  onToggle,
  children,
}: AccordionRowProps) {
  return (
    <>
      <Pressable style={styles.accordionHeader} onPress={onToggle}>
        <View style={styles.accordionHeaderLeft}>
          <CustomText style={styles.accordionTitle}>{title}</CustomText>
        </View>
        <View style={styles.accordionHeaderRight}>
          <CustomText style={styles.accordionValue}>{value}</CustomText>
          <VectoreIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            icon="Ionicons"
            size={theme.SF(18)}
            color={theme.colors.lightText}
          />
        </View>
      </Pressable>
      {expanded ? children : null}
    </>
  );
}

function ServiceHeader({
  styles,
  serviceImage,
  name,
  bookedServiceDate,
  bookedServiceTime,
}: {
  styles: any;
  serviceImage: any;
  name: string;
  bookedServiceDate?: string;
  bookedServiceTime?: string;
}) {
  return (
    <View style={styles.serviceInfo}>
      <View style={styles.serviceImageContainer}>
        <ImageLoader
          source={serviceImage}
          mainImageStyle={styles.serviceImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.serviceDetails}>
        <CustomText style={styles.serviceName}>{name}</CustomText>
        {bookedServiceDate && bookedServiceTime ? (
          <CustomText>
            {bookedServiceDate} at {bookedServiceTime}
          </CustomText>
        ) : null}
      </View>
    </View>
  );
}

function StatusMessages({
  serviceStatus,
  serviceStatusColor,
  serviceRemark,
  styles,
  theme,
  t,
  rescheduleDate,
  rescheduleTime,
  rescheduleReason,
}: {
  serviceStatus?: string;
  serviceStatusColor: string;
  serviceRemark?: string;
  styles: any;
  theme: any;
  t: any;
  rescheduleDate?: string;
  rescheduleTime?: string;
  rescheduleReason?: string;
}) {
  return (
    <>
      {serviceStatus === 'cancelledBySp' && (
        <>
          <CustomText
            color={serviceStatusColor}
            fontFamily={theme.fonts.MEDIUM}
            fontSize={theme.fontSize.sm}
            style={{ marginBottom: theme.SH(3), marginTop: theme.SH(8) }}
          >
            {t('bookingDetails.serviceCard.cancelledByProvider')}
          </CustomText>
          {serviceRemark ? (
            <CustomText
              color={Colors.textAppColor}
              fontFamily={theme.fonts.REGULAR}
              fontSize={theme.fontSize.sm}
              style={{
                marginTop: theme.SH(0),
                marginBottom: theme.SH(8),
              }}
            >
              {t('bookingDetails.serviceCard.cancellationReason')}: {serviceRemark}
            </CustomText>
          ) : null}
        </>
      )}

      {serviceStatus === 'cancelledByCustomer' && (
        <>
          <CustomText
            color={serviceStatusColor}
            fontFamily={theme.fonts.MEDIUM}
            fontSize={theme.fontSize.sm}
            style={{ marginBottom: theme.SH(3), marginTop: theme.SH(8) }}
          >
            {t('bookingDetails.serviceCard.cancelledByCustomer')}
          </CustomText>
          {serviceRemark ? (
            <CustomText
              color={serviceStatusColor}
              fontFamily={theme.fonts.MEDIUM}
              fontSize={theme.fontSize.sm}
              style={{
                marginTop: theme.SH(0),
                marginBottom: theme.SH(8),
              }}
            >
              {t('bookingDetails.serviceCard.cancellationReason')}: {serviceRemark}
            </CustomText>
          ) : null}
        </>
      )}

      {serviceStatus === 'rejected' && (
        <>
          <CustomText
            color={serviceStatusColor}
            fontFamily={theme.fonts.MEDIUM}
            fontSize={theme.fontSize.sm}
            style={styles.statusText}
          >
            {t('bookingDetails.serviceCard.rejectedByProvider')}
          </CustomText>
          {serviceRemark ? (
            <CustomText
              color={serviceStatusColor}
              fontFamily={theme.fonts.MEDIUM}
              fontSize={theme.fontSize.sm}
              style={{
                marginTop: theme.SH(0),
                marginBottom: theme.SH(8),
              }}
            >
              {t('bookingDetails.serviceCard.cancellationReason')}: {serviceRemark}
            </CustomText>
          ) : null}
        </>
      )}

      {serviceStatus === 'rescheduledByCustomer' && (
        <>
          <CustomText
            color={serviceStatusColor}
            fontFamily={theme.fonts.MEDIUM}
            fontSize={theme.fontSize.sm}
            style={{ marginTop: theme.SH(8), marginBottom: theme.SH(4) }}
          >
            {t('bookingDetails.serviceCard.rescheduledByYouWait')}{' '}
            <CustomText style={{ marginTop: theme.SH(8), marginBottom: theme.SH(4) }}>
              {' '}
              <CustomText
                color={theme.colors.primary}
                fontFamily={theme.fonts.MEDIUM}
                fontSize={theme.fontSize.xs}
              >
                {rescheduleDate},
              </CustomText>{' '}
              <CustomText
                color={theme.colors.primary}
                fontFamily={theme.fonts.MEDIUM}
                fontSize={theme.fontSize.xs}
              >
                {rescheduleTime}
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
            {t('bookingDetails.serviceCard.rescheduledBySp')}{' '}
            <CustomText style={{ marginTop: theme.SH(8), marginBottom: theme.SH(4) }}>
              {' '}
              <CustomText
                color={theme.colors.primary}
                fontFamily={theme.fonts.MEDIUM}
                fontSize={theme.fontSize.xs}
              >
                {rescheduleDate},
              </CustomText>{' '}
              <CustomText
                color={theme.colors.primary}
                fontFamily={theme.fonts.MEDIUM}
                fontSize={theme.fontSize.xs}
              >
                {rescheduleTime}
              </CustomText>
            </CustomText>
          </CustomText>
        </>
      )}

      {serviceStatus !== 'rescheduledByCustomer' &&
        serviceStatus !== 'rescheduledBySp' &&
        rescheduleTime &&
        rescheduleDate && (
          <CustomText style={{ marginTop: theme.SH(8), marginBottom: theme.SH(4) }}>
            {' '}
            <CustomText
              color={theme.colors.primary}
              fontFamily={theme.fonts.MEDIUM}
              fontSize={theme.fontSize.xs}
            >
              {rescheduleDate},
            </CustomText>{' '}
            <CustomText
              color={theme.colors.primary}
              fontFamily={theme.fonts.MEDIUM}
              fontSize={theme.fontSize.xs}
            >
              {rescheduleTime}
            </CustomText>
          </CustomText>
        )}

      {serviceStatus === 'rescheduledByCustomer' ||
        (serviceStatus == 'rescheduledBySp' && (
          <CustomText
            color={theme.colors.text}
            fontFamily={theme.fonts.MEDIUM}
            fontSize={theme.fontSize.sm}
            style={{ marginBottom: theme.SH(4) }}
          >
            <CustomText
              color={theme.colors.text}
              fontFamily={theme.fonts.REGULAR}
              fontSize={theme.fontSize.xs}
            >
              {rescheduleReason}
            </CustomText>
          </CustomText>
        ))}
    </>
  );
}

export default function BookingServiceCard({
  services,
  onCallMember: _onCallMember,
  // pageName = '',
  onCancelService,
  onAddAddOns,
  onReschedule,
  mainBookingStatus,
  onAcceptService,
  onRejectService,
  onTrackMember,
  serviceLoadingStates,
  trackMemberLoadingId,
  showTrackMemberButton,
}: BookingServiceCardProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  console.log('mainBookingStatus-----BookingServiceCard', mainBookingStatus);
 
  const safeServices = Array.isArray(services) ? services : [];

  const [expandedAddOnsById, setExpandedAddOnsById] = useState<Record<string, boolean>>({});
  const [expandedPriceById, setExpandedPriceById] = useState<Record<string, boolean>>({});

  const toggleAddOns = useCallback((id: string) => {
    setExpandedAddOnsById(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const togglePrice = useCallback((id: string) => {
    setExpandedPriceById(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <View style={styles.section}>
      {safeServices.map((service, index) => {
        if (service == null) return null;
        const {
          _id,
          images,
          name,
          bookedServiceDate,
          bookedServiceTime,
          bookingStatus,
          assignedMember,
          remark,
          rescheduleDate,
          rescheduleTime,
          rescheduleReason,
          appliedOffer,
          selectedAddOns,
          addOnsTotal,
          postBookingAddOns,
          postBookingAddOnsTotal,
          price,
          totalAmount,
          discountAmount,
          discountedAmount,
        } = service as Service & Record<string, any>;

        const serviceKey = String(_id ?? `service-${index}`);
        const serviceImage = images?.[0] ? { uri: images[0] } : imagePaths.no_image;
        const serviceStatus = bookingStatus;
        const mappedServiceStatus = mapBookingStatusToDisplay(serviceStatus ?? '');
        const serviceStatusColor = getStatusColor(serviceStatus);

        const normalizedAddOnsTotal = Number.isFinite(addOnsTotal) ? Number(addOnsTotal) : 0;
        const safePostBookingAddOns = Array.isArray(postBookingAddOns)
          ? postBookingAddOns.filter(Boolean)
          : [];
        const normalizedPostBookingTotal =
          Number.isFinite(postBookingAddOnsTotal)
            ? Number(postBookingAddOnsTotal)
            : safePostBookingAddOns.reduce((sum: number, item: any) => {
                const line =
                  Number(item?.lineAmount ?? item?.amount ?? 0) ||
                  Number(item?.unitAmount ?? 0) * Number(item?.quantity ?? 0) ||
                  0;
                return sum + (Number.isFinite(line) ? line : 0);
              }, 0);

        const serviceTotalLabel = formatAmount(
          Number.isFinite(discountedAmount)
            ? discountedAmount
            : Number.isFinite(totalAmount)
              ? totalAmount
              : 0,
        );

        const addOnsExpanded = !!expandedAddOnsById[serviceKey];
        const postAddOnsExpanded = !!expandedAddOnsById[`${serviceKey}__post`];
        const priceExpanded = !!expandedPriceById[serviceKey];
        return (
          <View
            key={_id ?? `service-${index}`}
            style={styles.serviceCard}
          >
            <ServiceHeader
              styles={styles}
              serviceImage={serviceImage}
              name={name}
              bookedServiceDate={bookedServiceDate}
              bookedServiceTime={bookedServiceTime}
            />

            <StatusMessages
              serviceStatus={serviceStatus}
              serviceStatusColor={serviceStatusColor}
              serviceRemark={remark}
              styles={styles}
              theme={theme}
              t={t}
              rescheduleDate={rescheduleDate}
              rescheduleTime={rescheduleTime}
              rescheduleReason={rescheduleReason}
            />

            {/* Applied Offer */}
            {appliedOffer ? (
              <View style={styles.appliedOfferContainer}>
                <View style={styles.appliedOfferContent}>
                  <View style={styles.appliedOfferInfo}>
                    <CustomText style={styles.appliedOfferTitle}>
                      {t('checkout.offerLine', {
                        title: appliedOffer?.title ?? '',
                        percent: appliedOffer?.discountValue ?? 0,
                      })}
                    </CustomText>
                    {/* {(Number(service?.discountAmount) || 0) > 0 && (
                                            <CustomText style={styles.appliedDiscountAmount}>
                                                Discount: {formatAmount(Number.isFinite(service?.discountAmount) ? service.discountAmount : 0)}
                                            </CustomText>
                                        )} */}
                  </View>
                </View>
              </View>
            ) : null}

            {/* Selected Add-ons (with discount % when applicable) */}
            {Array.isArray(selectedAddOns) && selectedAddOns.length > 0 && (
              <>
                <View style={styles.divider} />
                <AccordionRow
                  styles={styles}
                  theme={theme}
                  title={t('bookingDetails.serviceCard.priceAddons')}
                  value={formatAmount(normalizedAddOnsTotal)}
                  expanded={addOnsExpanded}
                  onToggle={() => toggleAddOns(serviceKey)}
                >
                  <View style={styles.addOnsContainer}>
                    {selectedAddOns
                      .filter((addOn: any) => addOn != null)
                      .map((addOn: any, addOnIndex: number) => {
                        const addOnPrice = Number(addOn?.price) || 0;
                        const discountPct = Math.min(
                          100,
                          Math.max(0, Number(addOn?.discountPercentage) || 0),
                        );
                        const displayOriginal = formatAmount(
                          Number.isFinite(addOnPrice) ? addOnPrice : 0,
                        );
                        return (
                          <View
                            key={addOn._id ?? `addon-${addOnIndex}`}
                            style={styles.addOnTag}
                          >
                            <CustomText style={styles.addOnTagText}>
                              {addOn?.name ?? ''}: {displayOriginal}
                              {discountPct
                                ? ` (${t('checkout.percentOff', { percent: discountPct })})`
                                : ''}
                            </CustomText>
                          </View>
                        );
                      })}
                  </View>
                </AccordionRow>
              </>
            )}

            {/* Post-booking additional add-ons (paid after booking) */}
            {safePostBookingAddOns.length > 0 ? (
              <>
                <View style={styles.divider} />
                <AccordionRow
                  styles={styles}
                  theme={theme}
                  title={t('bookingDetails.serviceCard.additionalAddons')}
                  value={formatAmount(normalizedPostBookingTotal)}
                  expanded={postAddOnsExpanded}
                  onToggle={() => toggleAddOns(`${serviceKey}__post`)}
                >
                  <View style={styles.addOnsContainer}>
                    {safePostBookingAddOns.map((item: any, idx: number) => {
                      const name =
                        item?.addon?.name ?? item?.name ?? 'Add-on';
                      const qty = Math.max(1, Number(item?.quantity) || 1);
                      const unit = Number(item?.unitAmount ?? 0) || 0;
                      const line =
                        Number(item?.lineAmount ?? item?.amount ?? 0) ||
                        unit * qty;
                      return (
                        <View
                          key={item?._id ?? item?.addonId ?? `post-addon-${idx}`}
                          style={styles.addOnTag}
                        >
                          <CustomText style={styles.addOnTagText}>
                            {name} × {qty} • {formatAmount(line)}
                          </CustomText>
                        </View>
                      );
                    })}
                  </View>
                </AccordionRow>
              </>
            ) : null}

            {/* Price Summary */}
            <View style={styles.divider} />
            <AccordionRow
              styles={styles}
              theme={theme}
              title={t('bookingDetails.serviceCard.priceTotal')}
              value={serviceTotalLabel}
              expanded={priceExpanded}
              onToggle={() => togglePrice(serviceKey)}
            >
              <View style={styles.priceSummaryContainer}>
                {price !== undefined && (
                  <View style={styles.priceRow}>
                    <CustomText style={styles.priceLabel}>
                      {t('bookingDetails.serviceCard.priceService')}
                    </CustomText>
                    <CustomText style={styles.priceValue}>
                      {formatAmount(
                        Number.isFinite(price) ? price : 0,
                      )}
                    </CustomText>
                  </View>
                )}
                {normalizedAddOnsTotal > 0 && (
                  <View style={styles.priceRow}>
                    <CustomText style={styles.priceLabel}>
                      {t('bookingDetails.serviceCard.priceAddons')}
                    </CustomText>
                    <CustomText style={styles.priceValue}>
                      {formatAmount(normalizedAddOnsTotal)}
                    </CustomText>
                  </View>
                )}
                {totalAmount !== undefined && (
                  <View style={styles.priceRow}>
                    <CustomText style={styles.priceLabel}>
                      {t('bookingDetails.serviceCard.priceSubtotal')}
                    </CustomText>
                    <CustomText style={styles.priceValue}>
                      {formatAmount(
                        Number.isFinite(totalAmount) ? totalAmount : 0,
                      )}
                    </CustomText>
                  </View>
                )}
                {discountAmount !== undefined && Number(discountAmount) > 0 && (
                    <View style={styles.priceRow}>
                      <CustomText style={styles.priceLabel}>
                        {t('bookingDetails.serviceCard.priceDiscount')}
                      </CustomText>
                      <CustomText
                        style={[styles.priceValue, styles.discountText]}
                      >
                        -{formatAmount(
                          Number.isFinite(discountAmount) ? discountAmount : 0,
                        )}
                      </CustomText>
                    </View>
                  )}
                {discountedAmount !== undefined && (
                  <View style={[styles.priceRow, styles.totalPriceRow]}>
                    <CustomText style={styles.totalPriceLabel}>
                      {t('bookingDetails.serviceCard.priceTotal')}
                    </CustomText>
                    <CustomText style={styles.totalPriceValue}>
                      {formatAmount(
                        Number.isFinite(discountedAmount)
                          ? discountedAmount
                          : 0,
                      )}
                    </CustomText>
                  </View>
                )}
              </View>
            </AccordionRow>

            {/* Member Assignment Section */}

            <View style={styles.memberSection}>
              {assignedMember ? (
                <>
                  <CustomText
                    color={theme.colors.text}
                    fontFamily={theme.fonts.MEDIUM}
                    fontSize={theme.fontSize.sm}
                    style={styles.assignedMemberText}
                  >
                    {t('bookingDetails.serviceCard.assignedMember')}
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
              ) : null}

              {/* {(serviceStatus === 'accepted' || serviceStatus === 'requested') && ( */}
              <View style={styles.serviceActionContainer}>
                {serviceStatus === 'rescheduledBySp' && (
                  <View style={{ flexDirection: 'row', gap: SW(8) }}>
                    <CustomButton
                      title={t('bookingDetails.serviceCard.rejectReschedule')}
                      onPress={() => onRejectService?.(service._id)}
                      isLoading={
                        serviceLoadingStates?.[service._id] === 'reject'
                      }
                      disable={serviceLoadingStates?.[service._id] === 'reject'}
                      backgroundColor={theme.colors.red || '#FF4D4D'}
                      textColor={theme.colors.white}
                      buttonStyle={[
                        styles.rescheduleButton,
                        { backgroundColor: theme.colors.red || '#FF4D4D' },
                      ]}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                    <CustomButton
                      title={t('bookingDetails.serviceCard.acceptReschedule')}
                      onPress={() => onAcceptService?.(service._id)}
                      isLoading={
                        serviceLoadingStates?.[service._id] === 'accept'
                      }
                      disable={serviceLoadingStates?.[service._id] === 'accept'}
                      backgroundColor={theme.colors.primary}
                      textColor={theme.colors.white}
                      buttonStyle={styles.rescheduleButton}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  </View>
                )}
                {(serviceStatus === 'accepted' ||
                  serviceStatus === 'rescheduledBySp' ||
                  serviceStatus === 'rescheduledByCustomer') && (
                  <View style={styles.serviceActionButtonWrap}>
                    <CustomButton
                      title={t('bookingDetails.serviceCard.reschedule')}
                      onPress={() => onReschedule?.(service as any)}
                      backgroundColor={theme.colors.primary}
                      textColor={theme.colors.white}
                      buttonStyle={styles.rescheduleButton1}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  </View>
                )}
                {serviceStatus === 'ongoing' && onAddAddOns ? (
                  <View style={styles.serviceActionButtonWrap}>
                    <CustomButton
                      title={t('bookingDetail.addOns.addButton')}
                      onPress={() => onAddAddOns(service as any)}
                      backgroundColor={theme.colors.primary}
                      textColor={theme.colors.white}
                      buttonStyle={styles.rescheduleButton1}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  </View>
                ) : null}
                {serviceStatus === 'onTheWay' && showTrackMemberButton && onTrackMember ? (
                  <View
                    style={[
                      styles.serviceActionButtonWrap,
                      styles.fullWidthServiceAction,
                    ]}
                  >
                    <CustomButton
                      title={t('bookingDetails.serviceCard.trackMember')}
                      onPress={() => onTrackMember(service as any)}
                      isLoading={trackMemberLoadingId === _id}
                      disable={trackMemberLoadingId === _id}
                      backgroundColor={theme.colors.primary}
                      textColor={theme.colors.white}
                      buttonStyle={[
                        styles.rescheduleButton1,
                        styles.fullWidthServiceActionButton,
                      ]}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  </View>
                ) : null}
                {/* {(serviceStatus === 'rescheduledByCustomer' ||
                  serviceStatus === 'accepted') && (
                  <View style={styles.serviceActionButtonWrap}>
                    <CustomButton
                      title={t('bookingDetails.cancelService')}
                      onPress={() => onCancelService?.(service._id)}
                      backgroundColor={theme.colors.red}
                      textColor={theme.colors.white}
                      buttonStyle={styles.cancelServiceButton}
                      buttonTextStyle={styles.rescheduleButtonText}
                    />
                  </View>
                )} */}
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
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SH(4),
      gap: SW(10),
    },
    accordionHeaderLeft: {
      flex: 1,
      minWidth: 0,
    },
    accordionHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(8),
    },
    accordionTitle: {
      fontSize: SF(13),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    accordionValue: {
      fontSize: SF(13),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
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
      width: '48%',
      // marginBottom: SH(8),
    },
    rescheduleButton1: {
      borderRadius: SF(8),
      paddingVertical: SH(8),
      backgroundColor: Colors.primary_light,
      borderWidth: 1,
      borderColor: Colors.primary,
      // marginBottom: SH(8),
    },
    rescheduleButtonText: {
      fontSize: SF(11),
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
    fullWidthServiceAction: {
      width: '100%',
      flexBasis: '100%',
      alignSelf: 'stretch',
    },
    fullWidthServiceActionButton: {
      width: '100%',
      alignSelf: 'stretch',
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
