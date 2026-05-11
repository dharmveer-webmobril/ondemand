// Provider reviews tab — switches between Provider, Service and Team reviews.
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeType, useThemeContext } from '@utils/theme';
import {
  CustomText,
  VectoreIcons,
  CustomButton,
  Shimmer,
} from '@components/common';
import RatingChart from './RatingChart';
import ReviewItem from './ReviewItem';
import {
  useGetServiceReviews,
  useGetSpReviews,
  useGetMemberReviews,
  useGetServiceProviderMembers,
  type RatingReviewListItem,
  type SPMember,
} from '@services/api/queries/appQueries';

type ProviderService = {
  _id: string;
  name?: string;
};

type ViewMode = 'sp' | 'service' | 'member';

type ProviderReviewsTabProps = {
  spId: string | null | undefined;
  services?: ProviderService[];
  refreshing?: boolean;
  onRefresh?: () => void;
};

type ViewByOption = {
  key: ViewMode;
  labelKey: string;
  icon: string;
};

const VIEW_BY_OPTIONS: ViewByOption[] = [
  {
    key: 'sp',
    labelKey: 'providerDetails.reviews.viewByProvider',
    icon: 'person-outline',
  },
  {
    key: 'service',
    labelKey: 'providerDetails.reviews.viewByServices',
    icon: 'construct-outline',
  },
  {
    key: 'member',
    labelKey: 'providerDetails.reviews.viewByTeam',
    icon: 'people-outline',
  },
];

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

function computeDistribution(reviews: RatingReviewListItem[]) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const v = Math.min(5, Math.max(1, Math.round(Number(r?.rating) || 0)));
    if (v >= 1 && v <= 5) counts[v - 1] += 1;
  });
  const total = counts.reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map(stars => {
    const count = counts[stars - 1];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { stars, count, percentage };
  });
}

function computeAverage(reviews: RatingReviewListItem[]) {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce(
    (acc, r) => acc + (Number(r?.rating) || 0),
    0,
  );
  return sum / reviews.length;
}

export default function ProviderReviewsTab({
  spId,
  services = [],
  refreshing = false,
  onRefresh,
}: ProviderReviewsTabProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const [mode, setMode] = useState<ViewMode>('sp');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    services[0]?._id ?? null,
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (services.length === 0) {
      setSelectedServiceId(null);
      return;
    }
    if (!selectedServiceId || !services.some(s => s._id === selectedServiceId)) {
      setSelectedServiceId(services[0]?._id ?? null);
    }
  }, [services, selectedServiceId]);

  const {
    data: membersData,
    isFetching: isFetchingMembers,
  } = useGetServiceProviderMembers(spId ?? null, { page: 1, limit: 50 });
  const members: SPMember[] = membersData?.ResponseData ?? [];

  useEffect(() => {
    if (members.length === 0) {
      setSelectedMemberId(null);
      return;
    }
    if (!selectedMemberId || !members.some(m => m._id === selectedMemberId)) {
      setSelectedMemberId(members[0]?._id ?? null);
    }
  }, [members, selectedMemberId]);

  const spQuery = useGetSpReviews(spId ?? null, {
    page: 1,
    limit: 20,
    enabled: mode === 'sp' && !!spId,
  });
  const serviceQuery = useGetServiceReviews(selectedServiceId, {
    page: 1,
    limit: 20,
    enabled: mode === 'service' && !!selectedServiceId,
  });
  const memberQuery = useGetMemberReviews(selectedMemberId, {
    page: 1,
    limit: 20,
    enabled: mode === 'member' && !!selectedMemberId,
  });

  const active =
    mode === 'sp'
      ? spQuery
      : mode === 'service'
        ? serviceQuery
        : memberQuery;

  const reviews: RatingReviewListItem[] = active.data?.ResponseData ?? [];
  // Show the skeleton ONLY before we have any data (initial fetch / tab switch
  // where the new query hasn't returned yet). Background refetches keep the
  // existing data visible so the section doesn't blink.
  const isInitialLoading = active.isLoading && reviews.length === 0;
  const isError = active.isError && reviews.length === 0;

  const distribution = useMemo(() => computeDistribution(reviews), [reviews]);
  const average = useMemo(() => computeAverage(reviews), [reviews]);

  const handleRefresh = () => {
    onRefresh?.();
    active.refetch();
  };

  const renderMemberChipsSkeleton = () => (
    <View style={styles.subChipsRow}>
      {[0, 1, 2].map(i => (
        <Shimmer
          key={i}
          width={theme.SW(72)}
          height={theme.SH(26)}
          borderRadius={theme.SF(16)}
        />
      ))}
    </View>
  );

  const renderSummarySkeleton = () => (
    <View style={[styles.summaryCard, styles.summarySkeleton]}>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonLeft}>
          <Shimmer
            width={theme.SF(52)}
            height={theme.SF(28)}
            borderRadius={theme.SF(6)}
          />
          <Shimmer
            width={theme.SF(84)}
            height={theme.SF(12)}
            borderRadius={theme.SF(4)}
            style={styles.skeletonGap}
          />
        </View>
        <View style={styles.skeletonRight}>
          {[0, 1, 2, 3, 4].map(i => (
            <Shimmer
              key={i}
              width={'100%'}
              height={theme.SF(8)}
              borderRadius={theme.SF(4)}
              style={i === 0 ? undefined : styles.skeletonGap}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderReviewSkeleton = (idx: number) => (
    <View key={idx} style={styles.reviewSkeleton}>
      <Shimmer
        width={theme.SF(40)}
        height={theme.SF(40)}
        borderRadius={theme.SF(20)}
      />
      <View style={styles.reviewSkeletonBody}>
        <Shimmer
          width={'45%'}
          height={theme.SF(12)}
          borderRadius={theme.SF(4)}
        />
        <Shimmer
          width={theme.SF(80)}
          height={theme.SF(10)}
          borderRadius={theme.SF(4)}
          style={styles.skeletonGap}
        />
        <Shimmer
          width={'92%'}
          height={theme.SF(10)}
          borderRadius={theme.SF(4)}
          style={styles.skeletonGap}
        />
      </View>
    </View>
  );

  const renderViewByChips = () => (
    <View style={styles.section}>
      <CustomText style={styles.sectionLabel}>
        {t('providerDetails.reviews.viewBy')}
      </CustomText>
      <View style={styles.chipsRow}>
        {VIEW_BY_OPTIONS.map(opt => {
          const isActive = opt.key === mode;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setMode(opt.key)}
              style={[
                styles.chip,
                ...(isActive ? [styles.chipActive] : []),
              ]}
            >
              <VectoreIcons
                icon="Ionicons"
                name={opt.icon}
                size={theme.SF(14)}
                color={isActive ? theme.colors.white : theme.colors.text}
              />
              <CustomText
                style={[
                  styles.chipText,
                  ...(isActive ? [styles.chipTextActive] : []),
                ]}
              >
                {t(opt.labelKey)}
              </CustomText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderServicePicker = () => (
    <View style={styles.section}>
      <CustomText style={styles.sectionLabel}>
        {t('providerDetails.reviews.service')}
      </CustomText>
      {services.length === 0 ? (
        <CustomText style={styles.muted}>
          {t('providerDetails.reviews.noServices')}
        </CustomText>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subChipsRow}
        >
          {services.map(s => {
            const isActive = s._id === selectedServiceId;
            return (
              <Pressable
                key={s._id}
                onPress={() => setSelectedServiceId(s._id)}
                style={[
                  styles.subChip,
                  ...(isActive ? [styles.subChipActive] : []),
                ]}
              >
                <CustomText
                  numberOfLines={1}
                  style={[
                    styles.subChipText,
                    ...(isActive ? [styles.subChipTextActive] : []),
                  ]}
                >
                  {s.name || '—'}
                </CustomText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  const renderMemberPicker = () => (
    <View style={styles.section}>
      <CustomText style={styles.sectionLabel}>
        {t('providerDetails.reviews.teamMember')}
      </CustomText>
      {isFetchingMembers && members.length === 0 ? (
        renderMemberChipsSkeleton()
      ) : members.length === 0 ? (
        <CustomText style={styles.muted}>
          {t('providerDetails.reviews.noTeam')}
        </CustomText>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subChipsRow}
        >
          {members.map(m => {
            const isActive = m._id === selectedMemberId;
            return (
              <Pressable
                key={m._id}
                onPress={() => setSelectedMemberId(m._id)}
                style={[
                  styles.subChip,
                  ...(isActive ? [styles.subChipActive] : []),
                ]}
              >
                <CustomText
                  numberOfLines={1}
                  style={[
                    styles.subChipText,
                    ...(isActive ? [styles.subChipTextActive] : []),
                  ]}
                >
                  {m.name || '—'}
                </CustomText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  const summaryCard = (
    <View style={styles.summaryCard}>
      {/* <CustomText style={styles.summaryLabel}>
        {t('providerDetails.reviews.averageThisPage')}
      </CustomText>
      <CustomText style={styles.summaryTotal}>
        {t('providerDetails.reviews.reviewTotal', { count: reviews.length })}
      </CustomText> */}
      <View style={styles.chartWrap}>
        <RatingChart
          overallRating={average}
          ratingDistribution={distribution}
        />
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isInitialLoading) {
      return (
        <View>
          {renderSummarySkeleton()}
          <View style={styles.reviewSkeletonList}>
            {[0, 1, 2].map(idx => renderReviewSkeleton(idx))}
          </View>
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.center}>
          <CustomText style={styles.muted}>
            {t('providerDetails.reviews.failedToLoad')}
          </CustomText>
          <CustomButton
            title={t('common.retry')}
            onPress={() => active.refetch()}
            backgroundColor={theme.colors.primary}
            textColor={theme.colors.white}
            paddingHorizontal={theme.SW(20)}
            marginTop={theme.SH(10)}
          />
        </View>
      );
    }
    if (mode === 'service' && !selectedServiceId) {
      return (
        <View style={styles.center}>
          <CustomText style={styles.muted}>
            {t('providerDetails.reviews.selectService')}
          </CustomText>
        </View>
      );
    }
    if (mode === 'member' && !selectedMemberId) {
      return (
        <View style={styles.center}>
          <CustomText style={styles.muted}>
            {t('providerDetails.reviews.selectMember')}
          </CustomText>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <VectoreIcons
          icon="Ionicons"
          name="chatbubble-ellipses-outline"
          size={theme.SF(36)}
          color={theme.colors.lightText || theme.colors.text}
        />
        <CustomText style={[styles.muted, styles.emptyText]}>
          {t('providerDetails.reviews.noReviewsYet')}
        </CustomText>
      </View>
    );
  };

  return (
    <FlatList
      data={reviews}
      keyExtractor={item => item._id}
      ListHeaderComponent={
        <View>
          {renderViewByChips()}
          {mode === 'service' ? renderServicePicker() : null}
          {mode === 'member' ? renderMemberPicker() : null}
          {reviews.length > 0 ? summaryCard : null}
          {/* Soft top-of-list indicator for background refetch when data is
              already on screen — avoids the heavy RefreshControl spinner. */}
          {reviews.length > 0 && active.isFetching ? (
            <View style={styles.refetchBar}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
              />
            </View>
          ) : null}
        </View>
      }
      renderItem={({ item }) => {
        const customer = item.customerId || {};
        const text =
          (item.review && typeof item.review === 'object' && item.review?.text) ||
          '';
        return (
          <ReviewItem
            id={item._id}
            userName={customer.name || '—'}
            userImage={customer.profileImage || undefined}
            rating={Number(item.rating) || 0}
            reviewText={text || t('providerDetails.reviews.noReviewText')}
            timeAgo={formatDate(item.createdAt || item.updatedAt)}
          />
        );
      }}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={!!refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary || '#135D96']}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SH, SW, SF, fonts: Fonts } = theme;
  return StyleSheet.create({
    listContent: {
      paddingBottom: SH(20),
      backgroundColor: Colors.background || Colors.white,
    },
    section: {
      paddingHorizontal: SW(16),
      paddingTop: SH(12),
    },
    sectionLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.lightText || Colors.text,
      marginBottom: SH(6),
    },
    chipsRow: {
      flexDirection: 'row',
      gap: SW(8),
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(6),
      paddingHorizontal: SW(12),
      paddingVertical: SH(6),
      borderRadius: SF(20),
      borderWidth: 1,
      borderColor: Colors.border || '#E5E7EB',
      backgroundColor: Colors.white,
    },
    chipActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    chipText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    chipTextActive: {
      color: Colors.white,
      fontFamily: Fonts.SEMI_BOLD,
    },
    subChipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(6),
      paddingRight: SW(16),
    },
    subChip: {
      paddingHorizontal: SW(10),
      paddingVertical: SH(4),
      borderRadius: SF(16),
      borderWidth: 1,
      borderColor: Colors.border || '#E5E7EB',
      backgroundColor: Colors.white,
    },
    subChipActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    subChipText: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      maxWidth: SW(140),
    },
    subChipTextActive: {
      color: Colors.white,
      fontFamily: Fonts.SEMI_BOLD,
    },
    summaryCard: {
      marginHorizontal: SW(16),
      marginTop: SH(14),
      marginBottom: SH(8),
      paddingTop: SH(12),
      borderRadius: SF(12),
      borderWidth: 1,
      borderColor: Colors.border || '#E5E7EB',
      backgroundColor: Colors.white,
      overflow: 'hidden',
    },
    summaryLabel: {
      textAlign: 'center',
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.lightText || Colors.text,
    },
    summaryTotal: {
      textAlign: 'center',
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || Colors.text,
      marginTop: SH(2),
    },
    chartWrap: {
      marginTop: SH(4),
    },
    muted: {
      fontSize: SF(13),
      color: Colors.lightText || Colors.text,
      fontFamily: Fonts.REGULAR,
      textAlign: 'center',
    },
    center: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      marginTop: SH(8),
    },
    refetchBar: {
      paddingVertical: SH(6),
      alignItems: 'center',
    },
    summarySkeleton: {
      paddingVertical: SH(14),
      paddingHorizontal: SW(16),
    },
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(16),
    },
    skeletonLeft: {
      width: SW(96),
      alignItems: 'center',
    },
    skeletonRight: {
      flex: 1,
    },
    skeletonGap: {
      marginTop: SH(6),
    },
    reviewSkeletonList: {
      marginTop: SH(8),
    },
    reviewSkeleton: {
      flexDirection: 'row',
      paddingHorizontal: SW(20),
      paddingVertical: SH(14),
      borderBottomWidth: 1,
      borderBottomColor: Colors.border || Colors.gray || '#E0E0E0',
    },
    reviewSkeletonBody: {
      flex: 1,
      marginLeft: SW(12),
      justifyContent: 'center',
    },
  });
};
