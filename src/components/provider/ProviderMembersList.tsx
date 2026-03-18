import { View, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import {
  useGetServiceProviderMembers,
  type SPMember,
} from '@services/api/queries/appQueries';

const MEMBERS_PAGE_SIZE = 10;

type ProviderMembersListProps = {
  spId: string | null;
};

function MemberCard({
  member,
  theme,
  styles,
}: {
  member: SPMember;
  theme: ThemeType;
  styles: ReturnType<typeof createStyles>;
}) {
  const serviceNames = member.services?.map((s) => s.name).join(', ') || '—';

  return (
    <View style={styles.card}>
      <View style={styles.cardImageWrap}>
        {member.profileImage ? (
          <Image source={{ uri: member.profileImage }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <CustomText style={styles.cardInitial}>
              {(member.name || '?').charAt(0).toUpperCase()}
            </CustomText>
          </View>
        )}
      </View>
      <CustomText style={styles.cardName} numberOfLines={1}>
        {member.name || '—'}
      </CustomText>
      {member.description ? (
        <CustomText style={styles.cardDesc} numberOfLines={2}>
          {member.description}
        </CustomText>
      ) : null}
      <CustomText style={styles.cardServices} >
        {serviceNames}
      </CustomText>
    </View>
  );
}

export default function ProviderMembersList({ spId }: ProviderMembersListProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [page, setPage] = useState(1);
  const [list, setList] = useState<SPMember[]>([]);

  const { data, isLoading, isFetching } = useGetServiceProviderMembers(spId, {
    page,
    limit: MEMBERS_PAGE_SIZE,
  });
  console.log('-----data-----', data);
  const rawData = data?.ResponseData ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;
  const hasMore = page < totalPages && rawData.length >= MEMBERS_PAGE_SIZE;
  const loadingMore = isFetching && page > 1;

  useEffect(() => {
    if (page === 1) {
      setList(rawData);
    } else {
      setList((prev) => {
        const ids = new Set(prev.map((m) => m._id));
        const newItems = rawData.filter((m) => !ids.has(m._id));
        return newItems.length ? [...prev, ...newItems] : prev;
      });
    }
  }, [page, data]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) setPage((p) => p + 1);
  }, [loadingMore, hasMore]);

  const renderItem = useCallback(
    ({ item }: { item: SPMember }) => (
      <MemberCard member={item} theme={theme} styles={styles} />
    ),
    [theme, styles]
  );

  if (!spId) return null;

  if (isLoading && page === 1) {
    return (
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Members</CustomText>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (list.length === 0) return null;

  return (
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>Members</CustomText>
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
  const cardWidth = SW(160);
  return StyleSheet.create({
    section: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(16),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionTitle: {
      fontSize: SF(16),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(12),
    },
    listContent: {
      paddingRight: SW(20),
    },
    card: {
      width: cardWidth,
      backgroundColor: Colors.gray ? `${Colors.gray}40` : '#f5f5f5',
      borderRadius: SF(12),
      padding: SW(12),
      marginRight: SW(12),
    },
    cardImageWrap: {
      width: cardWidth - SW(24),
      height: SH(80),
      borderRadius: SF(8),
      overflow: 'hidden',
      alignSelf: 'center',
      marginBottom: SH(8),
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    cardImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: Colors.primary || '#135D96',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardInitial: {
      fontSize: SF(28),
      fontFamily: Fonts.BOLD,
      color: Colors.whitetext || '#fff',
    },
    cardName: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(4),
    },
    cardDesc: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.text,
      marginBottom: SH(4),
    },
    cardServices: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
    },
    loaderWrap: {
      paddingVertical: SH(24),
      alignItems: 'center',
    },
    footerLoader: {
      width: SW(40),
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: SW(8),
    },
  });
};
