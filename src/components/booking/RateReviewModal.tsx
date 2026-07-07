import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  CustomText,
  CustomButton,
  ImageLoader,
  KeyboardModalAvoiding,
} from '@components/common';
import StarRating from 'react-native-star-rating-widget';
import imagePaths from '@assets';
import { SH } from '@utils/dimensions';
import ReviewChipsStrip, {
  type ReviewChipItem,
} from '@components/booking/ReviewChipsStrip';
import {
  useSubmitAllRatingReviews,
  type ServiceRatingItem,
  type SpRatingItem,
  type MemberRatingItem,
} from '@services/api/queries/appQueries';
import { handleApiError, handleSuccessToast } from '@utils/apiHelpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProviderDisplayName } from '@utils/tools';

export type RateReviewTab = 'service' | 'sp' | 'member';

type ServiceLike = {
  _id?: string;
  serviceId?: any;
  name?: string;
  images?: string[];
  assignedMember?: any;
  bookingStatus?: string;
};

type ProviderLike = {
  _id?: string;
  name?: string;
  profileImage?: string | null;
};

type RateReviewModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmitted?: (payload: ReviewPayload) => void;
  /** Mongo `_id` of the booking. Used for provider rating payload. */
  bookingId?: string | null;
  /** Booked services on the booking. Only `completed` ones are usually relevant. */
  services?: ServiceLike[];
  /** Provider (single, since one provider per booking). */
  provider?: ProviderLike | null;
};

type EntryState = { rating: number; review: string };

export type ReviewPayload = {
  provider: SpRatingItem[];
  services: ServiceRatingItem[];
  members: MemberRatingItem[];
};

function getServiceCatalogId(
  svc: ServiceLike | undefined | null,
): string | null {
  if (!svc) return null;
  const sid = svc.serviceId;
  if (typeof sid === 'string' && sid.length > 0) return sid;
  if (sid && typeof sid === 'object' && sid._id) return String(sid._id);
  return null;
}

function getServiceImage(svc: ServiceLike) {
  const img = svc?.images?.[0];
  return img ? { uri: img } : imagePaths.no_image;
}

function dedupeMembers(services: ServiceLike[]): Array<{
  id: string;
  name: string;
  profileImage?: string | null;
}> {
  const map = new Map<
    string,
    { id: string; name: string; profileImage?: string | null }
  >();
  services.forEach(s => {
    const m = s?.assignedMember;
    if (!m) return;
    const id = typeof m === 'object' ? m?._id : m;
    if (!id) return;
    const name =
      (typeof m === 'object' && (m?.name || m?.fullName)) ||
      i18next.t('bookingDetail.rateReview.memberFallback');
    const profileImage = typeof m === 'object' ? m?.profileImage ?? null : null;
    if (!map.has(String(id))) {
      map.set(String(id), { id: String(id), name: String(name), profileImage });
    }
  });
  return Array.from(map.values());
}

export default function RateReviewModal({
  visible,
  onClose,
  onSubmitted,
  bookingId = null,
  services = [],
  provider = null,
}: RateReviewModalProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const completedServices = useMemo(
    () => (services || []).filter(s => s != null && s?._id),
    [services],
  );

  const members = useMemo(
    () => dedupeMembers(completedServices),
    [completedServices],
  );
  const hasMembers = members.length > 0;

  const tabs = useMemo(() => {
    const opts: { key: RateReviewTab; label: string }[] = [
      { key: 'service', label: t('bookingDetail.rateReview.tabService') },
      { key: 'sp', label: t('bookingDetail.rateReview.tabSp') },
    ];
    if (hasMembers) {
      opts.push({
        key: 'member',
        label: t('bookingDetail.rateReview.tabMember'),
      });
    }
    return opts;
  }, [hasMembers, t]);

  const [tab, setTab] = useState<RateReviewTab>('service');

  const [serviceEntries, setServiceEntries] = useState<
    Record<string, EntryState>
  >({});
  const [memberEntries, setMemberEntries] = useState<
    Record<string, EntryState>
  >({});
  const [providerEntry, setProviderEntry] = useState<EntryState>({
    rating: 0,
    review: '',
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setTab('service');
      setServiceEntries({});
      setMemberEntries({});
      setProviderEntry({ rating: 0, review: '' });
      setSelectedServiceId(null);
      setSelectedMemberId(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (selectedServiceId == null && completedServices.length > 0) {
      setSelectedServiceId(String(completedServices[0]._id));
    }
  }, [visible, completedServices, selectedServiceId]);

  useEffect(() => {
    if (!visible) return;
    if (selectedMemberId == null && members.length > 0) {
      setSelectedMemberId(members[0].id);
    }
  }, [visible, members, selectedMemberId]);

  const updateServiceEntry = (id: string, patch: Partial<EntryState>) => {
    setServiceEntries(prev => {
      const current: EntryState = prev[id] ?? { rating: 0, review: '' };
      return { ...prev, [id]: { ...current, ...patch } };
    });
  };

  const updateMemberEntry = (id: string, patch: Partial<EntryState>) => {
    setMemberEntries(prev => {
      const current: EntryState = prev[id] ?? { rating: 0, review: '' };
      return { ...prev, [id]: { ...current, ...patch } };
    });
  };

  const { mutateAsync: submitAll, isPending: submitting } =
    useSubmitAllRatingReviews();

  const buildPayload = (): ReviewPayload => {
    const services: ServiceRatingItem[] = completedServices
      .map(svc => {
        const id = String(svc._id);
        const e = serviceEntries[id];
        if (!e || e.rating < 1) return null;
        const catalogId = getServiceCatalogId(svc);
        if (!catalogId) return null;
        return {
          serviceId: catalogId,
          bookedServiceId: id,
          rating: e.rating,
          review: (e.review || '').trim(),
        } as ServiceRatingItem;
      })
      .filter((x): x is ServiceRatingItem => !!x);

    const memberItems: MemberRatingItem[] = members
      .map(m => {
        const e = memberEntries[m.id];
        if (!e || e.rating < 1) return null;
        // Link the member rating to one of the booked services that has this member.
        const linkedService = completedServices.find(s => {
          const am = s?.assignedMember;
          const amId = typeof am === 'object' ? am?._id : am;
          return amId === m.id;
        });
        if (!linkedService?._id) return null;
        return {
          memberId: m.id,
          bookedServiceId: String(linkedService._id),
          rating: e.rating,
          review: (e.review || '').trim(),
        } as MemberRatingItem;
      })
      .filter((x): x is MemberRatingItem => !!x);

    const providerItems: SpRatingItem[] =
      providerEntry.rating >= 1 && provider?._id && bookingId
        ? [
            {
              spId: String(provider._id),
              bookingId,
              rating: providerEntry.rating,
              review: (providerEntry.review || '').trim(),
            },
          ]
        : [];

    return {
      provider: providerItems,
      services,
      members: memberItems,
    };
  };

  const hasAnyRating =
    providerEntry.rating > 0 ||
    Object.values(serviceEntries).some(e => e.rating > 0) ||
    Object.values(memberEntries).some(e => e.rating > 0);

  const sendPayload = async (payload: ReviewPayload) => {
    if (!bookingId) {
      handleApiError(new Error(t('bookingDetail.rateReview.missingBooking')));
      return;
    }
    try {
      const result = await submitAll({
        bookingMongoId: bookingId,
        services: payload.services,
        sp: payload.provider,
        members: payload.members,
      });

      const errors: string[] = [];
      if (result.service.status === 'error') {
        errors.push(
          `${t('bookingDetail.rateReview.tabService')}: ${
            result.service.message
          }`,
        );
      }
      if (result.sp.status === 'error') {
        errors.push(
          `${t('bookingDetail.rateReview.tabSp')}: ${result.sp.message}`,
        );
      }
      if (result.member.status === 'error') {
        errors.push(
          `${t('bookingDetail.rateReview.tabMember')}: ${
            result.member.message
          }`,
        );
      }

      if (errors.length === 0) {
        handleSuccessToast(t('bookingDetail.rateReview.submitSuccess'));
        onSubmitted?.(payload);
        onClose();
      } else {
        Alert.alert(
          t('bookingDetail.rateReview.partialErrorTitle'),
          errors.join('\n'),
          [{ text: t('bookingDetail.rateReview.close') }],
        );
        // Still notify parent in case partial succeeded; let parent refetch.
        onSubmitted?.(payload);
      }
    } catch (e) {
      handleApiError(e);
    }
  };

  const handleSubmit = () => {
    const payload = buildPayload();

    const missing: string[] = [];

    if (providerEntry.rating < 1) {
      missing.push(`• ${t('bookingDetail.rateReview.tabSp')}`);
    }

    const missingServices = completedServices.filter(s => {
      const e = serviceEntries[String(s._id)];
      return !e || e.rating < 1;
    });
    if (missingServices.length > 0) {
      const names = missingServices
        .map(s => s?.name || '—')
        .slice(0, 3)
        .join(', ');
      const more =
        missingServices.length > 3 ? ` +${missingServices.length - 3}` : '';
      missing.push(
        `• ${t('bookingDetail.rateReview.tabService')}: ${names}${more}`,
      );
    }

    const missingMembers = members.filter(m => {
      const e = memberEntries[m.id];
      return !e || e.rating < 1;
    });
    if (missingMembers.length > 0) {
      const names = missingMembers
        .map(m => m.name)
        .slice(0, 3)
        .join(', ');
      const more =
        missingMembers.length > 3 ? ` +${missingMembers.length - 3}` : '';
      missing.push(
        `• ${t('bookingDetail.rateReview.tabMember')}: ${names}${more}`,
      );
    }

    if (missing.length === 0) {
      sendPayload(payload);
      return;
    }

    Alert.alert(
      t('bookingDetail.rateReview.missingTitle'),
      `${t('bookingDetail.rateReview.missingMessage')}\n\n${missing.join(
        '\n',
      )}`,
      [
        {
          text: t('bookingDetail.rateReview.keepEditing'),
          style: 'cancel',
        },
        {
          text: t('bookingDetail.rateReview.submitAnyway'),
          style: 'destructive',
          onPress: () => sendPayload(payload),
        },
      ],
    );
  };

  // Resolve currently selected items + entries for the active tab
  const selectedService =
    completedServices.find(s => String(s._id) === selectedServiceId) || null;
  const selectedServiceEntry = (selectedServiceId &&
    serviceEntries[selectedServiceId]) || {
    rating: 0,
    review: '',
  };

  const selectedMember = members.find(m => m.id === selectedMemberId) || null;
  const selectedMemberEntry = (selectedMemberId &&
    memberEntries[selectedMemberId]) || {
    rating: 0,
    review: '',
  };

  const serviceChipItems: ReviewChipItem[] = completedServices.map(s => ({
    id: String(s._id),
    label: s.name || '—',
    imageSource: getServiceImage(s),
    rated: !!(s._id && serviceEntries[String(s._id)]?.rating > 0),
  }));

  const memberChipItems: ReviewChipItem[] = members.map(m => ({
    id: m.id,
    label: m.name,
    imageSource: m.profileImage ? { uri: m.profileImage } : imagePaths.no_image,
    rated: !!(memberEntries[m.id]?.rating > 0),
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardModalAvoiding style={styles.modalRoot}>
          <Pressable style={styles.overlay} onPress={onClose}>
            <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
              <View style={styles.header}>
                <CustomText style={styles.title}>
                  {t('bookingDetail.rateReview.title')}
                </CustomText>
                <Pressable onPress={onClose} hitSlop={12}>
                  <CustomText style={styles.close}>{'\u2715'}</CustomText>
                </Pressable>
              </View>

              <View style={styles.tabRow}>
                {tabs.map(opt => {
                  const active = opt.key === tab;
                  return (
                    <Pressable
                      key={opt.key}
                      style={styles.tabCell}
                      onPress={() => setTab(opt.key)}
                    >
                      <CustomText
                        style={[
                          styles.tabText,
                          ...(active ? [styles.tabTextActive] : []),
                        ]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </CustomText>
                      {active ? (
                        <View style={styles.tabUnderline} />
                      ) : (
                        <View style={styles.tabUnderlineSpacer} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {tab === 'service' ? (
                  completedServices.length === 0 ? (
                    <CustomText style={styles.mutedCenter}>
                      {t('bookingDetail.rateReview.noServices')}
                    </CustomText>
                  ) : (
                    <>
                      <CustomText style={styles.helperText}>
                        {t('bookingDetail.rateReview.selectServiceHint')}
                      </CustomText>
                      <ReviewChipsStrip
                        items={serviceChipItems}
                        selectedId={selectedServiceId}
                        onSelect={id => setSelectedServiceId(id)}
                      />
                      {selectedService ? (
                        <View style={styles.formCard}>
                          <CustomText
                            style={styles.formTitle}
                            numberOfLines={2}
                          >
                            {selectedService.name || '—'}
                          </CustomText>
                          <View style={styles.starsWrap}>
                            <StarRating
                              rating={selectedServiceEntry.rating}
                              onChange={v =>
                                updateServiceEntry(
                                  String(selectedService._id),
                                  {
                                    rating: v,
                                  },
                                )
                              }
                              starSize={theme.SF(34)}
                              color="#FFC107"
                              starStyle={styles.star}
                            />
                          </View>
                          <TextInput
                            style={styles.input}
                            placeholder={t(
                              'bookingDetail.rateReview.placeholderService',
                            )}
                            placeholderTextColor={theme.colors.lightText}
                            value={selectedServiceEntry.review}
                            onChangeText={v =>
                              updateServiceEntry(String(selectedService._id), {
                                review: v,
                              })
                            }
                            multiline
                            textAlignVertical="top"
                          />
                        </View>
                      ) : null}
                    </>
                  )
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
                    <View style={styles.starsWrap}>
                      <StarRating
                        rating={providerEntry.rating}
                        onChange={v =>
                          setProviderEntry(p => ({ ...p, rating: v }))
                        }
                        starSize={theme.SF(34)}
                        color="#FFC107"
                        starStyle={styles.star}
                      />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={t('bookingDetail.rateReview.placeholderSp')}
                      placeholderTextColor={theme.colors.lightText}
                      value={providerEntry.review}
                      onChangeText={v =>
                        setProviderEntry(p => ({ ...p, review: v }))
                      }
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                ) : null}

                {tab === 'member' ? (
                  members.length === 0 ? (
                    <CustomText style={styles.mutedCenter}>
                      {t('bookingDetail.rateReview.noMembers')}
                    </CustomText>
                  ) : (
                    <>
                      <CustomText style={styles.helperText}>
                        {t('bookingDetail.rateReview.selectMemberHint')}
                      </CustomText>
                      <ReviewChipsStrip
                        items={memberChipItems}
                        selectedId={selectedMemberId}
                        onSelect={id => setSelectedMemberId(id)}
                      />
                      {selectedMember ? (
                        <View style={styles.formCard}>
                          <CustomText
                            style={styles.formTitle}
                            numberOfLines={2}
                          >
                            {selectedMember.name}
                          </CustomText>
                          <View style={styles.starsWrap}>
                            <StarRating
                              rating={selectedMemberEntry.rating}
                              onChange={v =>
                                updateMemberEntry(selectedMember.id, {
                                  rating: v,
                                })
                              }
                              starSize={theme.SF(34)}
                              color="#FFC107"
                              starStyle={styles.star}
                            />
                          </View>
                          <TextInput
                            style={styles.input}
                            placeholder={t(
                              'bookingDetail.rateReview.placeholderMember',
                            )}
                            placeholderTextColor={theme.colors.lightText}
                            value={selectedMemberEntry.review}
                            onChangeText={v =>
                              updateMemberEntry(selectedMember.id, {
                                review: v,
                              })
                            }
                            multiline
                            textAlignVertical="top"
                          />
                        </View>
                      ) : null}
                    </>
                  )
                ) : null}
              </ScrollView>

              <View style={styles.footerRow}>
                <Pressable
                  style={[
                    styles.cancelOutline,
                    ...(submitting ? [styles.disabledSoft] : []),
                  ]}
                  onPress={submitting ? undefined : onClose}
                  disabled={submitting}
                >
                  <CustomText style={styles.cancelOutlineText}>
                    {t('bookingDetail.rateReview.cancel')}
                  </CustomText>
                </Pressable>
                <View style={styles.footerSpacer} />
                <CustomButton
                  title={t('bookingDetail.rateReview.submit')}
                  onPress={handleSubmit}
                  disable={!hasAnyRating || submitting}
                  isLoading={submitting}
                  backgroundColor={theme.colors.primary}
                  textColor={theme.colors.white}
                  buttonStyle={styles.submitBtn}
                  paddingHorizontal={theme.SW(20)}
                />
              </View>
            </Pressable>
          </Pressable>
        </KeyboardModalAvoiding>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    modalRoot: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.SF(16),
      borderTopRightRadius: theme.SF(16),
      paddingHorizontal: theme.SW(20),
      paddingTop: theme.SH(16),
      paddingBottom: theme.SH(20),
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.SH(12),
    },
    title: {
      fontSize: theme.fontSize?.lg ?? 18,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
    },
    close: {
      fontSize: theme.SF(18),
      color: theme.colors.lightText,
      padding: theme.SW(4),
    },
    tabRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border || '#E5E7EB',
      marginBottom: theme.SH(12),
    },
    tabCell: {
      flex: 1,
      alignItems: 'center',
      paddingBottom: theme.SH(6),
    },
    tabText: {
      fontSize: theme.fontSize?.sm ?? 13,
      fontFamily: theme.fonts?.MEDIUM,
      color: theme.colors.lightText,
      textAlign: 'center',
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontFamily: theme.fonts?.SEMI_BOLD,
    },
    tabUnderline: {
      marginTop: theme.SH(6),
      height: theme.SH(3),
      width: '72%',
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    tabUnderlineSpacer: {
      marginTop: theme.SH(6),
      height: theme.SH(3),
    },
    scrollContent: {
      paddingBottom: theme.SH(16),
    },
    helperText: {
      fontSize: theme.fontSize?.xs ?? 12,
      color: theme.colors.lightText,
      marginBottom: theme.SH(10),
    },
    mutedCenter: {
      fontSize: theme.fontSize?.sm ?? 14,
      color: theme.colors.lightText,
      textAlign: 'center',
      paddingVertical: theme.SH(24),
    },
    formCard: {
      borderWidth: 1,
      borderColor: theme.colors.border || '#E5E7EB',
      borderRadius: theme.borderRadius?.md ?? 12,
      padding: theme.SW(14),
      backgroundColor: theme.colors.white,
    },
    formTitle: {
      fontSize: theme.fontSize?.md ?? 15,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(4),
    },
    providerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(8),
    },
    providerAvatarWrap: {
      width: theme.SW(44),
      height: theme.SW(44),
      borderRadius: theme.SW(22),
      overflow: 'hidden',
      backgroundColor: theme.colors.gray || '#F1F1F1',
      marginRight: theme.SW(12),
    },
    providerAvatar: {
      width: '100%',
      height: '100%',
    },
    starsWrap: {
      alignItems: 'center',
      marginVertical: theme.SH(8),
    },
    star: {
      marginHorizontal: theme.SW(3),
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border || '#E5E7EB',
      borderRadius: theme.borderRadius?.md ?? 10,
      padding: theme.SW(10),
      minHeight: SH(80),
      fontSize: theme.fontSize?.sm ?? 14,
      color: theme.colors.text,
      fontFamily: theme.fonts?.REGULAR,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: theme.SH(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border || '#E5E7EB',
    },
    cancelOutline: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius?.md ?? 10,
      paddingVertical: theme.SH(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelOutlineText: {
      fontSize: theme.fontSize?.sm ?? 14,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.primary,
    },
    footerSpacer: {
      width: theme.SW(12),
    },
    submitBtn: {
      flex: 1,
      borderRadius: theme.borderRadius?.md ?? 10,
    },
    disabledSoft: {
      opacity: 0.6,
    },
  });
