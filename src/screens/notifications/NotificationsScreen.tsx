import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, VectoreIcons } from '@components/common';
import { useThemeContext } from '@utils/theme';
import {
  useGetNotifications,
  useDeleteNotification,
  type NotificationItem,
} from '@services/api/queries/appQueries';
import { queryClient } from '@services/api';
import { showToast } from '@components/common';
import { handleApiError } from '@utils/apiHelpers';

const PAGE_SIZE = 10;

function formatNotificationDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [page, setPage] = useState(1);
  const [list, setList] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useGetNotifications({
    page,
    limit: PAGE_SIZE,
  });
  const deleteMutation = useDeleteNotification();

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const hasMore = page < totalPages;
  const loadingMore = isFetching && page > 1;
  const pageItems = data?.ResponseData?.notifications ?? [];

  useEffect(() => {
    if (page === 1) {
      setList(pageItems);
    } else {
      setList((prev) => {
        if (pageItems.length === 0) return prev;
        const ids = new Set(prev.map((x) => x._id));
        const newItems = pageItems.filter((x) => !ids.has(x._id));
        return newItems.length ? [...prev, ...newItems] : prev;
      });
    }
  }, [page, data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
useFocusEffect(useCallback(() => {
  refetch();
}, [refetch]));
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isFetching) setPage((p) => p + 1);
  }, [loadingMore, hasMore, isFetching]);

  const handleDelete = useCallback(
    (item: NotificationItem) => {
      Alert.alert(
        t('notifications.deleteConfirm'),
        '',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(item._id);
              try {
                await deleteMutation.mutateAsync(item._id);
                showToast({ type: 'success', message: t('notifications.deleteSuccess') });
                queryClient.invalidateQueries({ queryKey: ['customerNotifications'] });
                setList((prev) => prev.filter((x) => x._id !== item._id));
              } catch (err) {
                handleApiError(err);
              } finally {
                setDeletingId(null);
              }
            },
          },
        ]
      );
    },
    [deleteMutation, t]
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const isDeleting = deletingId === item._id;
      return (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <CustomText style={styles.title} numberOfLines={1}>
              {item.title}
            </CustomText>
            <CustomText style={styles.description} numberOfLines={4}>
              {item.description}
            </CustomText>
            <CustomText style={styles.date}>{formatNotificationDate(item.createdAt)}</CustomText>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
            disabled={isDeleting}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <VectoreIcons
                name="trash-outline"
                icon="Ionicons"
                size={theme.SF(22)}
                color={(theme.colors as any).error || '#c0392b'}
              />
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [styles, deletingId, handleDelete, theme]
  );

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : null;

  const renderEmpty = () =>
    !isLoading && list.length === 0 ? (
      <View style={styles.emptyWrap}>
        <CustomText style={styles.emptyText}>{t('notifications.empty')}</CustomText>
      </View>
    ) : null;

  if (isError && list.length === 0) {
    return (
      <Container safeArea style={styles.container}>
        <AppHeader
          title={t('notifications.title')}
          onLeftPress={() => navigation.goBack()}
          backgroundColor={theme.colors.background}
          tintColor={theme.colors.text}
          containerStyle={{ paddingHorizontal: 20 }}
        />
        <View style={styles.emptyWrap}>
          <CustomText style={styles.emptyText}>{t('notifications.loadError')}</CustomText>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea style={styles.container}>
      <AppHeader
        title={t('notifications.title')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        tintColor={theme.colors.text}
        containerStyle={{ paddingHorizontal: 20 }}
      />
      {isLoading && list.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, list.length === 0 && styles.listContentEmpty]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    listContentEmpty: {
      flexGrow: 1,
    },
    loadingWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius?.md || 12,
      padding: theme.SW(16),
      marginBottom: theme.SH(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cardContent: {
      flex: 1,
    },
    title: {
      fontSize: theme.fontSize?.md || 16,
      fontFamily: theme.fonts?.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: 4,
    },
    description: {
      fontSize: theme.fontSize?.sm || 14,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.lightText || '#666',
      marginBottom: 4,
    },
    date: {
      fontSize: theme.fontSize?.xs || 12,
      fontFamily: theme.fonts?.REGULAR,
      color: theme.colors.lightText || '#999',
    },
    deleteButton: {
      padding: theme.SW(8),
      marginLeft: 8,
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    emptyWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: theme.fontSize?.sm || 14,
      color: theme.colors.lightText || '#666',
    },
  });
