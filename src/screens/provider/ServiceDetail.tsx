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
import DeliveryModeModal from '@components/category/DeliveryModeModal';
import SCREEN_NAMES from '@navigation/ScreenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 220;

const formatAmount = (amount: number | string | null | undefined): string => {
  const value = Number(amount) || 0;
  return `$${value.toFixed(2)}`;
};

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

export default function ServiceDetail() {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const service = route.params?.service ?? null;
  const provider = route.params?.provider ?? service?.provider ?? null;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showDeliveryModeModal, setShowDeliveryModeModal] = useState(false);

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

  const providerId = provider?._id || provider?.id || service?.sp_id;

  const onCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.x;
      setCarouselIndex(Math.round(offset / SCREEN_WIDTH));
    },
    [],
  );

  const handleBookService = useCallback(() => {
    if (!service || availableModes.length === 0) {
      showToast({
        type: 'info',
        message: t('providerDetails.serviceNotAvailableMode'),
      });
      return;
    }
    setShowDeliveryModeModal(true);
  }, [availableModes.length, service, t]);

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

  if (!service) {
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

  const priceType =
    service.priceType === 'hourly'
      ? t('serviceDetail.hourly')
      : t('serviceDetail.fixed');
  const categoryName = getCategoryName(service.category_id || service.category);
  const discount = Number(service.discountPercentage || service.highestDiscount) || 0;
  const addOns = Array.isArray(service.serviceAddOns) ? service.serviceAddOns : [];

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
              {imageList.map((_, index) => (
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
          <DetailRow label={t('serviceDetail.provider')} value={providerName} theme={theme} />
          <DetailRow label={t('serviceDetail.category')} value={categoryName} theme={theme} />
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

        <View style={styles.card}>
          <CustomText style={styles.sectionTitle}>
            {t('serviceDetail.details')}
          </CustomText>
          <DetailRow
            label={t('serviceDetail.duration')}
            value={formatDuration(service.time)}
            theme={theme}
          />
          <DetailRow
            label={t('serviceDetail.preferences')}
            value={preferenceLabels}
            theme={theme}
          />
        </View>

        {addOns.length > 0 ? (
          <View style={styles.card}>
            <CustomText style={styles.sectionTitle}>
              {t('serviceDetail.addOns')}
            </CustomText>
            {addOns.map((addOn: any) => (
              <DetailRow
                key={addOn?._id || addOn?.name}
                label={addOn?.name || '-'}
                value={`${formatAmount(addOn?.price)} · ${formatDuration(addOn?.duration)}`}
                theme={theme}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, theme.SH(12)) },
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
    alignItems: 'center',
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
