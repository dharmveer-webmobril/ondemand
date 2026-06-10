import { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppHeader,
  Container,
  CustomButton,
  CustomText,
  ImageLoader,
  LoadingComp,
  showToast,
} from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import imagePaths from '@assets';
import { formatPreferenceLabel, getProviderDisplayName } from '@utils/tools';
import { formatAmount } from '@utils/formatAmount';
import DeliveryModeModal from '@components/category/DeliveryModeModal';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useGetCustomerServiceDetail } from '@services/index';
import { GuestLoginRequiredModal } from '@components';
import { useGuestGuard } from '@utils/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 220;

const formatDuration = (minutes: number | string | null | undefined): string => {
  const total = Number(minutes) || 0;
  if (!total) return '-';
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

const getCategoryName = (category: unknown): string => {
  if (!category) return '-';
  if (typeof category === 'string') return category;
  if (typeof category === 'object' && 'name' in category) {
    return String((category as { name?: string }).name || '-');
  }
  return '-';
};

const getImageSource = (uri: string | null | undefined) =>
  uri ? { uri } : imagePaths.no_image;

const formatDiscount = (offer: any): string => {
  const value = Number(offer?.discountValue) || 0;
  if (!value) return '-';
  return offer?.discountType === 'percentage'
    ? `${Math.round(value)}%`
    : formatAmount(value);
};

const getDiscountedAmount = (
  amount: number | string | null | undefined,
  discountPercentage: number | string | null | undefined,
): string => {
  const price = Number(amount) || 0;
  const discount = Math.min(100, Math.max(0, Number(discountPercentage) || 0));
  return formatAmount(price - (price * discount) / 100);
};

const getEntityId = (value: any): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value?._id != null) return String(value._id);
  if (value?.id != null) return String(value.id);
  return null;
};

const formatBusinessAddress = (businessProfile: any): string => {
  return (
    businessProfile?.formattedAddress ||
    [businessProfile?.line1, businessProfile?.line2, businessProfile?.landmark]
      .filter(Boolean)
      .join(', ') ||
    '-'
  );
};

export default function ServiceDetail() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const routeService = route.params?.service ?? null;
  const routeProvider =
    route.params?.provider ??
    routeService?.provider ??
    routeService?.serviceProvider ??
    null;
  const routeProviderId =
    route.params?.providerId ??
    getEntityId(routeProvider) ??
    getEntityId(routeService?.serviceProvider) ??
    getEntityId(routeService?.provider) ??
    getEntityId(routeService?.sp_id);
  const routeServiceId =
    route.params?.serviceId ?? getEntityId(routeService);
  const {
    data: serviceDetailData,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
  } = useGetCustomerServiceDetail(routeProviderId, routeServiceId);
  const responseData = serviceDetailData?.ResponseData;
  const service = responseData?.service ?? routeService;
  const provider =
    responseData?.serviceProvider ??
    service?.serviceProvider ??
    routeProvider;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showDeliveryModeModal, setShowDeliveryModeModal] = useState(false);
  const {
    requireFullAccount,
    modalVisible,
    modalMessage,
    closeModal,
    goToLogin,
  } = useGuestGuard();

  const imageList = useMemo(() => {
    const images = Array.isArray(service?.images) ? service.images : [];
    if (!images.length) return [imagePaths.no_image];
    return images.map((uri: string) => ({ uri }));
  }, [service?.images]);

  const preferenceLabels = useMemo(() => {
    const prefs = Array.isArray(service?.preferences) ? service.preferences : [];
    if (!prefs.length) return t('serviceDetail.none');
    return prefs
      .map((pref: string) => formatPreferenceLabel(pref, t))
      .filter(Boolean)
      .join(', ');
  }, [service?.preferences, t]);

  const providerName = useMemo(
    () =>
      getProviderDisplayName(
        provider,
        t('providerDetails.providerDefaultName'),
      ),
    [provider, t],
  );

  const availableModes = useMemo(
    () =>
      (Array.isArray(service?.preferences) ? service.preferences : []).filter(
        (mode: string) => ['atHome', 'online', 'onPremises'].includes(mode),
      ),
    [service?.preferences],
  );

  const providerId =
    getEntityId(provider) ||
    getEntityId(service?.serviceProvider) ||
    getEntityId(service?.sp_id) ||
    routeProviderId;

  const onCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.x;
      setCarouselIndex(Math.round(offset / SCREEN_WIDTH));
    },
    [],
  );

  const handleBookService = useCallback(() => {
    if (!requireFullAccount(undefined, t('guest.bookingLoginMessage'))) {
      return;
    }
    if (!service || availableModes.length === 0) {
      showToast({
        type: 'info',
        message: t('providerDetails.serviceNotAvailableMode'),
      });
      return;
    }
    setShowDeliveryModeModal(true);
  }, [availableModes.length, requireFullAccount, service, t]);

  const handleDeliveryModeConfirm = useCallback(
    (deliveryMode: string | null) => {
      if (!deliveryMode || !service || !providerId) return;
      if (!availableModes.includes(deliveryMode)) {
        showToast({
          type: 'info',
          message: t('providerDetails.serviceNotAvailableMode'),
        });
        return;
      }

      setShowDeliveryModeModal(false);
      navigation.navigate(SCREEN_NAMES.BOOK_APPOINTMENT, {
        providerId,
        serviceId: service._id,
        selectedServices: [service],
        bookingDetails: { deliveryMode },
        providerData: provider,
      });
    },
    [availableModes, navigation, provider, providerId, service, t],
  );

  if (!service && !isLoadingDetail) {
    return (
      <Container
        safeArea={false}
        statusBarColor={theme.colors.white}
        style={styles.container}
      >
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <AppHeader
            title={t('serviceDetail.title')}
            onLeftPress={() => navigation.goBack()}
            backgroundColor={theme.colors.white}
            tintColor={theme.colors.text}
          />
        </View>
        <View style={styles.emptyContainer}>
          <LoadingComp visible={false} />
          <CustomText
            fontSize={theme.fontSize.md}
            fontFamily={theme.fonts.REGULAR}
            color={theme.colors.gray || '#666'}
            textAlign="center"
          >
            {t('serviceDetail.notFound')}
          </CustomText>
        </View>
      </Container>
    );
  }

  if (!service && isLoadingDetail) {
    return (
      <Container
        safeArea={false}
        statusBarColor={theme.colors.white}
        style={styles.container}
      >
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <AppHeader
            title={t('serviceDetail.title')}
            onLeftPress={() => navigation.goBack()}
            backgroundColor={theme.colors.white}
            tintColor={theme.colors.text}
          />
        </View>
        <LoadingComp visible />
      </Container>
    );
  }

  const priceType =
    service.priceType === 'hourly'
      ? t('serviceDetail.hourly')
      : t('serviceDetail.fixed');
  const categoryName = getCategoryName(service.category || service.category_id);
  const discount = Number(service.discountPercentage || service.highestDiscount) || 0;
  const businessProfile = provider?.businessProfile ?? service?.serviceProvider?.businessProfile;
  const addOns = Array.isArray(responseData?.addons)
    ? responseData.addons
    : Array.isArray(service.serviceAddOns)
      ? service.serviceAddOns
      : [];
  const activeOffers = Array.isArray(responseData?.activeOffers)
    ? responseData.activeOffers
    : Array.isArray(service.activeOffers)
      ? service.activeOffers
      : [];
  const providerBusinessName =
    businessProfile?.name || providerName || t('providerDetails.providerDefaultName');
  const providerImage =
    businessProfile?.bannerImage || provider?.profileImage || null;
  const providerAddress = formatBusinessAddress(businessProfile);

  return (
    <Container
      safeArea={false}
      statusBarColor={theme.colors.white}
      style={styles.container}
    >
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('serviceDetail.title')}
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
        <View style={styles.heroImageWrap}>
          <FlatList
            data={imageList}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onCarouselScroll}
            keyExtractor={(_, i) => `img-${i}`}
            renderItem={({ item }) => (
              <View style={styles.carouselSlide}>
                <ImageLoader
                  source={item}
                  mainImageStyle={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
            )}
          />
          {imageList.length > 1 ? (
            <View style={styles.dotContainer}>
              {imageList.map((_: unknown, index: number) => (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.dot,
                    index === carouselIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <CustomText
            fontSize={theme.fontSize.xl}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={theme.colors.text}
            style={styles.serviceName}
          >
            {service.name || '-'}
          </CustomText>
          <DetailRow label={t('serviceDetail.category')} value={categoryName} theme={theme} />
          <DetailRow label={t('serviceDetail.duration')} value={formatDuration(service.time)} theme={theme} />
          <DetailRow
            label={t('serviceDetail.preferences')}
            value={preferenceLabels}
            theme={theme}
          />
        </View>

        <View style={styles.card}>
          <CustomText style={styles.sectionTitle}>
            {t('serviceDetail.description')}
          </CustomText>
          <CustomText style={styles.descriptionText}>
            {service.description?.trim() || t('serviceDetail.noDescription')}
          </CustomText>
        </View>

        <View style={styles.card}>
          <CustomText style={styles.sectionTitle}>
            {t('serviceDetail.pricing')}
          </CustomText>
          <DetailRow
            label={t('serviceDetail.price')}
            value={`${formatAmount(service.price)} ${priceType}`}
            theme={theme}
          />
          {Number(service.consultationPrice) > 0 ? (
            <DetailRow
              label={t('serviceDetail.consultation')}
              value={formatAmount(service.consultationPrice)}
              theme={theme}
            />
          ) : null}
          {discount > 0 ? (
            <DetailRow
              label={t('serviceDetail.discount')}
              value={`${Math.round(discount)}%`}
              theme={theme}
            />
          ) : null}
        </View>

        {provider ? (
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>
              {t('serviceDetail.serviceProvider')}
            </CustomText>
            <View style={styles.providerSummary}>
              <ImageLoader
                source={getImageSource(providerImage)}
                mainImageStyle={styles.providerImage}
                resizeMode="cover"
              />
              <View style={styles.providerInfo}>
                <CustomText style={styles.providerName}>
                  {providerBusinessName}
                </CustomText>
                <CustomText style={styles.providerAddress}>
                  {providerAddress}
                </CustomText>
              </View>
            </View>
          </View>
        ) : null}

        {addOns.length > 0 ? (
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>
              {t('serviceDetail.addOns')}
            </CustomText>
            {addOns.map((addOn: any) => (
              <View key={addOn?._id || addOn?.name} style={styles.subCard}>
                <DetailRow label={t('serviceDetail.name')} value={addOn?.name || '-'} theme={theme} />
                <DetailRow label={t('serviceDetail.price')} value={formatAmount(addOn?.price)} theme={theme} />
                <DetailRow
                  label={t('serviceDetail.offerAmount')}
                  value={getDiscountedAmount(addOn?.price, addOn?.discountPercentage)}
                  theme={theme}
                />
                <DetailRow label={t('serviceDetail.duration')} value={formatDuration(addOn?.duration)} theme={theme} />
                {Number(addOn?.discountPercentage) > 0 ? (
                  <DetailRow
                    label={t('serviceDetail.discount')}
                    value={`${Math.round(Number(addOn.discountPercentage))}%`}
                    theme={theme}
                  />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {activeOffers.length > 0 ? (
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>
              {t('serviceDetail.activeOffers')}
            </CustomText>
            {activeOffers.map((offer: any) => (
              <View key={offer?._id || offer?.title} style={styles.subCard}>
                {offer?.image ? (
                  <ImageLoader
                    source={getImageSource(offer.image)}
                    mainImageStyle={styles.offerImage}
                    resizeMode="cover"
                  />
                ) : null}
                <DetailRow label={t('serviceDetail.titleLabel')} value={offer?.title || '-'} theme={theme} />
                <DetailRow label={t('serviceDetail.discount')} value={formatDiscount(offer)} theme={theme} />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom+10, theme.SH(12)) },
        ]}
      >
        <CustomButton
          title={t('serviceDetail.bookService')}
          onPress={handleBookService}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.whitetext}
          buttonStyle={styles.bookButton}
        />
      </View>

      <DeliveryModeModal
        visible={showDeliveryModeModal}
        onClose={() => setShowDeliveryModeModal(false)}
        onConfirm={handleDeliveryModeConfirm}
        availableModes={availableModes}
      />
      <LoadingComp visible={isFetchingDetail && !!service} />

      <GuestLoginRequiredModal
        visible={modalVisible}
        message={modalMessage}
        onClose={closeModal}
        onLogin={goToLogin}
      />
    </Container>
  );
}

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ThemeType;
}) {
  return (
    <View style={detailRowStyles.row}>
      <CustomText
        fontSize={theme.fontSize.sm}
        fontFamily={theme.fonts.REGULAR}
        color={theme.colors.lightText}
        style={detailRowStyles.label}
      >
        {label}
      </CustomText>
      <CustomText
        fontSize={theme.fontSize.sm}
        fontFamily={theme.fonts.MEDIUM}
        color={theme.colors.text}
        textAlign="right"
        style={detailRowStyles.value}
      >
        {value}
      </CustomText>
    </View>
  );
}

const detailRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  label: {
    flex: 1,
    paddingRight: 12,
  },
  value: {
    flex: 1.3,
  },
});

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F5F5F5',
    },
    headerContainer: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(16),
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(12),
      paddingBottom: theme.SH(96),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.SW(20),
    },
    heroImageWrap: {
      width: SCREEN_WIDTH,
      height: IMAGE_HEIGHT,
      marginHorizontal: -theme.SW(16),
      marginBottom: theme.SH(16),
      backgroundColor: theme.colors.gray || '#E2E8F0',
    },
    carouselSlide: {
      width: SCREEN_WIDTH,
      height: IMAGE_HEIGHT,
    },
    heroImage: {
      width: SCREEN_WIDTH,
      height: IMAGE_HEIGHT,
      borderRadius: 0,
    },
    dotContainer: {
      position: 'absolute',
      bottom: theme.SH(12),
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.SW(6),
    },
    dot: {
      width: theme.SW(6),
      height: theme.SW(6),
      borderRadius: theme.SW(3),
      backgroundColor: 'rgba(255,255,255,0.55)',
    },
    dotActive: {
      width: theme.SW(8),
      height: theme.SW(8),
      borderRadius: theme.SW(4),
      backgroundColor: theme.colors.primary,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      marginBottom: theme.SH(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    serviceName: {
      marginBottom: theme.SH(8),
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(12),
    },
    descriptionText: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || theme.colors.text,
      lineHeight: theme.SH(22),
    },
    subCard: {
      backgroundColor: theme.colors.background || '#F8FAFC',
      borderRadius: theme.borderRadius.md,
      padding: theme.SW(12),
      marginBottom: theme.SH(10),
    },
    providerSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(12),
    },
    providerImage: {
      width: theme.SW(72),
      height: theme.SW(72),
      borderRadius: theme.SF(12),
    },
    providerInfo: {
      flex: 1,
    },
    providerName: {
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(4),
    },
    providerAddress: {
      fontSize: theme.fontSize.sm,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || theme.colors.text,
      lineHeight: theme.SH(19),
    },
    offerImage: {
      width: '100%',
      height: theme.SH(120),
      borderRadius: theme.SF(10),
      marginBottom: theme.SH(10),
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.SW(8),
      marginTop: theme.SH(10),
    },
    chip: {
      backgroundColor: theme.colors.secondary || '#EEF6F9',
      borderRadius: theme.SF(14),
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(5),
    },
    chipText: {
      fontSize: theme.fontSize.xs,
      fontFamily: theme.fonts.MEDIUM,
      color: theme.colors.text,
    },
    bottomSpacer: {
      height: theme.SH(40),
    },
    footer: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.secondary || '#EAEAEA',
    },
    bookButton: {
      borderRadius: theme.SF(12),
    },
  });
