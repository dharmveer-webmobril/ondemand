import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, VectoreIcons } from '@components/common';
import imagePaths from '@assets';
import ReviewChipsStrip, {
  type ReviewChipItem,
} from '@components/booking/ReviewChipsStrip';
import type { CustomerReviewInfo } from '@utils/bookingReviewHelpers';
import { getProviderDisplayName } from '@utils/tools';

type ServiceLike = {
  _id?: string;
  name?: string;
  images?: string[];
  assignedMember?: any;
  customerReviewInfo?: CustomerReviewInfo | null;
};

type ProviderLike = {
  _id?: string;
  name?: string;
  profileImage?: string | null;
};

type ReadOnlyTab = 'service' | 'sp' | 'member';

type BookingReviewsViewProps = {
  services: ServiceLike[];
  provider: ProviderLike | null;
};

function ReadOnlyStars({
  value,
  color,
  size,
}: {
  value: number;
  color: string;
  size: number;
}) {
  const filled = Math.min(5, Math.max(0, Math.round(Number(value) || 0)));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <VectoreIcons
          key={i}
          icon="Ionicons"
          name={i <= filled ? 'star' : 'star-outline'}
          size={size}
          color={i <= filled ? color : '#C4C4C4'}
        />
      ))}
    </View>
  );
}

function getServiceImage(svc: ServiceLike) {
  const img = svc?.images?.[0];
  return img ? { uri: img } : imagePaths.no_image;
}

type MemberRef = {
  id: string;
  name: string;
  profileImage?: string | null;
};

function dedupeMembers(services: ServiceLike[]): MemberRef[] {
  const map = new Map<string, MemberRef>();
  services.forEach(s => {
    const m = s?.assignedMember;
    if (!m) return;
    const id = typeof m === 'object' ? m?._id : m;
    if (!id) return;
    const name =
      (typeof m === 'object' && (m?.name || m?.fullName)) || 'Member';
    const profileImage =
      typeof m === 'object' ? m?.profileImage ?? null : null;
    if (!map.has(String(id))) {
      map.set(String(id), { id: String(id), name: String(name), profileImage });
    }
  });
  return Array.from(map.values());
}

function pickMemberServiceForView(
  services: ServiceLike[],
  memberId: string,
): ServiceLike | null {
  let submitted: ServiceLike | null = null;
  let fallback: ServiceLike | null = null;
  services.forEach(s => {
    const m = s?.assignedMember;
    const mid = m && (typeof m === 'object' ? m?._id : m);
    if (String(mid || '') !== memberId) return;
    if (!fallback) fallback = s;
    if (s?.customerReviewInfo?.member?.submitted && !submitted) submitted = s;
  });
  return submitted || fallback;
}

function pickSpServiceForView(services: ServiceLike[]): ServiceLike | null {
  return (
    services.find(s => s?.customerReviewInfo?.sp?.submitted) ||
    services[0] ||
    null
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BookingReviewsView({
  services,
  provider,
}: BookingReviewsViewProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const completedServices = useMemo(
    () => (services || []).filter(s => s && s._id),
    [services],
  );

  const members = useMemo(
    () => dedupeMembers(completedServices),
    [completedServices],
  );
  const hasMembers = members.length > 0;

  const tabs = useMemo(() => {
    const opts: { key: ReadOnlyTab; label: string }[] = [
      { key: 'service', label: t('bookingDetail.rateReview.tabService') },
      { key: 'sp', label: t('bookingDetail.rateReview.tabSp') },
    ];
    if (hasMembers) {
      opts.push({ key: 'member', label: t('bookingDetail.rateReview.tabMember') });
    }
    return opts;
  }, [hasMembers, t]);

  const [tab, setTab] = useState<ReadOnlyTab>('service');

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    completedServices[0]?._id ? String(completedServices[0]._id) : null,
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    members[0]?.id || null,
  );

  useEffect(() => {
    if (
      completedServices.length > 0 &&
      (!selectedServiceId ||
        !completedServices.some(s => String(s._id) === selectedServiceId))
    ) {
      setSelectedServiceId(String(completedServices[0]._id));
    }
  }, [completedServices, selectedServiceId]);

  useEffect(() => {
    if (
      members.length > 0 &&
      (!selectedMemberId || !members.some(m => m.id === selectedMemberId))
    ) {
      setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);

  const selectedService = useMemo(
    () =>
      completedServices.find(s => String(s._id) === selectedServiceId) || null,
    [completedServices, selectedServiceId],
  );

  const serviceSlice = selectedService?.customerReviewInfo?.service;

  const memberServiceForView = useMemo(
    () =>
      selectedMemberId
        ? pickMemberServiceForView(completedServices, selectedMemberId)
        : null,
    [completedServices, selectedMemberId],
  );
  const memberSlice = memberServiceForView?.customerReviewInfo?.member;

  const spServiceForView = useMemo(
    () => pickSpServiceForView(completedServices),
    [completedServices],
  );
  const spSlice = spServiceForView?.customerReviewInfo?.sp;

  const serviceChipItems: ReviewChipItem[] = completedServices.map(s => ({
    id: String(s._id),
    label: s.name || '—',
    imageSource: getServiceImage(s),
    rated: !!s.customerReviewInfo?.service?.submitted,
  }));

  const memberChipItems: ReviewChipItem[] = members.map(m => ({
    id: m.id,
    label: m.name,
    imageSource: m.profileImage ? { uri: m.profileImage } : imagePaths.no_image,
    rated: completedServices.some(s => {
      const am = s.assignedMember;
      const mid = am && (typeof am === 'object' ? am?._id : am);
      return (
        String(mid || '') === m.id && !!s.customerReviewInfo?.member?.submitted
      );
    }),
  }));

  const selectedMember = useMemo(
    () => members.find(m => m.id === selectedMemberId) || null,
    [members, selectedMemberId],
  );

  if (completedServices.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.tabRow}>
        {tabs.map(tabItem => {
          const isActive = tabItem.key === tab;
          return (
            <Pressable
              key={tabItem.key}
              style={styles.tabHit}
              onPress={() => setTab(tabItem.key)}
            >
              <CustomText
                style={[
                  styles.tabLabel,
                  ...(isActive ? [styles.tabLabelActive] : []),
                ]}
                numberOfLines={1}
              >
                {tabItem.label}
              </CustomText>
              {isActive ? (
                <View style={styles.tabUnderline} />
              ) : (
                <View style={styles.tabUnderlinePlaceholder} />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.body}>
        {tab === 'service' ? (
          <>
            <CustomText style={styles.helperText}>
              {t('bookingDetail.rateReview.selectServiceToView')}
            </CustomText>
            <ReviewChipsStrip
              items={serviceChipItems}
              selectedId={selectedServiceId}
              onSelect={id => setSelectedServiceId(id)}
            />
            {selectedService ? (
              <View style={styles.formCard}>
                <CustomText style={styles.formTitle} numberOfLines={2}>
                  {selectedService.name || '—'}
                </CustomText>
                {serviceSlice?.submitted ? (
                  <>
                    <View style={styles.starsWrap}>
                      <ReadOnlyStars
                        value={serviceSlice.rating ?? 0}
                        color="#FFC107"
                        size={theme.SF(28)}
                      />
                    </View>
                    {serviceSlice.reviewText ? (
                      <CustomText style={styles.reviewText}>
                        {serviceSlice.reviewText}
                      </CustomText>
                    ) : (
                      <CustomText style={styles.muted}>
                        {t('bookingDetail.rateReview.noWrittenReview')}
                      </CustomText>
                    )}
                    {serviceSlice.updatedAt ? (
                      <CustomText style={styles.mutedSmall}>
                        {t('bookingDetail.rateReview.submittedOn', {
                          date: formatDate(serviceSlice.updatedAt),
                        })}
                      </CustomText>
                    ) : null}
                  </>
                ) : (
                  <CustomText style={styles.muted}>
                    {t('bookingDetail.rateReview.notRatedYet')}
                  </CustomText>
                )}
              </View>
            ) : null}
          </>
        ) : null}

        {tab === 'sp' ? (
          <View style={styles.formCard}>
            <View style={styles.providerHeader}>
              <View style={styles.providerAvatarWrap}>
                <ImageLoader
                  source={
                    provider?.profileImage
                      ? { uri: provider.profileImage }
                      : imagePaths.no_image
                  }
                  mainImageStyle={styles.providerAvatar}
                  resizeMode="cover"
                  fallbackImage={imagePaths.no_image}
                />
              </View>
              <CustomText style={styles.formTitle} numberOfLines={2}>
                {getProviderDisplayName(
                  provider,
                  t('bookingList.serviceProviderDefault'),
                )}
              </CustomText>
            </View>
            {spSlice?.submitted ? (
              <>
                <View style={styles.starsWrap}>
                  <ReadOnlyStars
                    value={spSlice.rating ?? 0}
                    color="#FFC107"
                    size={theme.SF(28)}
                  />
                </View>
                {spSlice.reviewText ? (
                  <CustomText style={styles.reviewText}>
                    {spSlice.reviewText}
                  </CustomText>
                ) : (
                  <CustomText style={styles.muted}>
                    {t('bookingDetail.rateReview.noWrittenReview')}
                  </CustomText>
                )}
                {spSlice.updatedAt ? (
                  <CustomText style={styles.mutedSmall}>
                    {t('bookingDetail.rateReview.submittedOn', {
                      date: formatDate(spSlice.updatedAt),
                    })}
                  </CustomText>
                ) : null}
              </>
            ) : (
              <CustomText style={styles.muted}>
                {t('bookingDetail.rateReview.notRatedYet')}
              </CustomText>
            )}
          </View>
        ) : null}

        {tab === 'member' ? (
          hasMembers ? (
            <>
              <CustomText style={styles.helperText}>
                {t('bookingDetail.rateReview.selectMemberToView')}
              </CustomText>
              <ReviewChipsStrip
                items={memberChipItems}
                selectedId={selectedMemberId}
                onSelect={id => setSelectedMemberId(id)}
              />
              {selectedMember ? (
                <View style={styles.formCard}>
                  <CustomText style={styles.formTitle} numberOfLines={2}>
                    {selectedMember.name}
                  </CustomText>
                  {memberSlice?.submitted ? (
                    <>
                      <View style={styles.starsWrap}>
                        <ReadOnlyStars
                          value={memberSlice.rating ?? 0}
                          color="#FFC107"
                          size={theme.SF(28)}
                        />
                      </View>
                      {memberSlice.reviewText ? (
                        <CustomText style={styles.reviewText}>
                          {memberSlice.reviewText}
                        </CustomText>
                      ) : (
                        <CustomText style={styles.muted}>
                          {t('bookingDetail.rateReview.noWrittenReview')}
                        </CustomText>
                      )}
                      {memberSlice.updatedAt ? (
                        <CustomText style={styles.mutedSmall}>
                          {t('bookingDetail.rateReview.submittedOn', {
                            date: formatDate(memberSlice.updatedAt),
                          })}
                        </CustomText>
                      ) : null}
                    </>
                  ) : (
                    <CustomText style={styles.muted}>
                      {t('bookingDetail.rateReview.notRatedYet')}
                    </CustomText>
                  )}
                </View>
              ) : null}
            </>
          ) : (
            <CustomText style={styles.muted}>
              {t('bookingDetail.rateReview.noMembers')}
            </CustomText>
          )
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    wrap: {
      marginTop: theme.SH(10),
    },
    tabRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border || '#E5E7EB',
    },
    tabHit: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.SH(8),
    },
    tabLabel: {
      fontSize: theme.fontSize?.xs ?? 12,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.lightText,
      textAlign: 'center',
    },
    tabLabelActive: {
      color: theme.colors.primary,
      fontFamily: theme.fonts?.SEMI_BOLD,
    },
    tabUnderline: {
      marginTop: theme.SH(6),
      height: theme.SH(3),
      width: '70%',
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    tabUnderlinePlaceholder: {
      marginTop: theme.SH(6),
      height: theme.SH(3),
    },
    body: {
      paddingTop: theme.SH(12),
      paddingHorizontal: theme.SW(10),
    },
    helperText: {
      fontSize: theme.fontSize?.xs ?? 12,
      color: theme.colors.lightText,
      marginBottom: theme.SH(10),
    },
    formCard: {
      borderWidth: 1,
      borderColor: theme.colors.border || '#E5E7EB',
      borderRadius: theme.borderRadius?.md ?? 12,
      padding: theme.SW(14),
      backgroundColor: theme.colors.white,
    },
    formTitle: {
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(8),
    },
    providerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(6),
    },
    providerAvatarWrap: {
      width: theme.SF(36),
      height: theme.SF(36),
      borderRadius: theme.SF(18),
      overflow: 'hidden',
      marginRight: theme.SW(10),
      backgroundColor: theme.colors.gray || '#F1F1F1',
    },
    providerAvatar: {
      width: '100%',
      height: '100%',
    },
    starsWrap: {
      marginVertical: theme.SH(6),
    },
    reviewText: {
      marginTop: theme.SH(8),
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.text,
      lineHeight: theme.SH(20),
    },
    muted: {
      marginTop: theme.SH(4),
      fontSize: theme.fontSize?.xs ?? 12,
      color: theme.colors.lightText,
      fontFamily: theme.fonts?.REGULAR,
    },
    mutedSmall: {
      marginTop: theme.SH(6),
      fontSize: theme.fontSize?.xxs ?? 10,
      color: theme.colors.lightText,
      fontFamily: theme.fonts?.REGULAR,
    },
  });
