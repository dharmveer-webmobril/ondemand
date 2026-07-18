import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, VectoreIcons, AnimatedEnter, AnimatedPressable } from '@components/common';
import { useThemeContext } from '@utils/theme';
import {
  useGetNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
  refreshNotificationsUnreadCount,
  type NotificationItem,
} from '@services/api/queries/notificationQueries';
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
  const clearAllMutation = useClearAllNotifications();
  const { mutate: markAllNotificationsRead } = useMarkAllNotificationsRead();

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const hasMore = page < totalPages;
  const loadingMore = isFetching && page > 1;
  const pageItems = useMemo(
    () => data?.ResponseData?.notifications ?? [],
    [data],
  );

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
  }, [page, pageItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  useFocusEffect(
    useCallback(() => {
      refetch();
      markAllNotificationsRead();
    }, [refetch, markAllNotificationsRead]),
  );
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isFetching) setPage((p) => p + 1);
  }, [loadingMore, hasMore, isFetching]);

  const handleDelete = useCallback(
    (item: NotificationItem) => {
      Alert.alert(
        t('notifications.deleteConfirm'),
        '',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              setDeletingId(item._id);
              try {
                await deleteMutation.mutateAsync(item._id);
                showToast({ type: 'success', message: t('notifications.deleteSuccess') });
                queryClient.invalidateQueries({ queryKey: ['customerNotifications'] });
                refreshNotificationsUnreadCount();
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

  const handleClearAll = useCallback(() => {
    if (list.length === 0 || clearAllMutation.isPending) return;

    Alert.alert(t('notifications.clearAllConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('notifications.clearAll'),
        style: 'destructive',
        onPress: async () => {
          try {
            await clearAllMutation.mutateAsync();
            setList([]);
            setPage(1);
            showToast({
              type: 'success',
              message: t('notifications.clearAllSuccess'),
            });
          } catch (err) {
            handleApiError(err);
          }
        },
      },
    ]);
  }, [clearAllMutation, list.length, t]);

  const renderItem = useCallback(
    ({ item, index }: { item: NotificationItem; index: number }) => {
      const isDeleting = deletingId === item._id;
      return (
        <AnimatedEnter index={index}>
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
            <AnimatedPressable
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
              disabled={isDeleting}
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
          </AnimatedPressable>
        </View>
        </AnimatedEnter>
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
          containerStyle={styles.headerContainer}
        />
        <View style={styles.emptyWrap}>
          <CustomText style={styles.emptyText}>{t('notifications.loadError')}</CustomText>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea style={styles.container}>
      <View style={styles.notificationHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.headerBackButton,
            pressed && styles.pressed,
          ]}
        >
          <VectoreIcons
            icon="FontAwesome"
            name="angle-left"
            size={theme.SF(32)}
            color={theme.colors.text}
          />
        </Pressable>
        <View pointerEvents="none" style={styles.headerTitleWrapper}>
          <CustomText style={styles.headerTitle} numberOfLines={1}>
            {t('notifications.title')}
          </CustomText>
        </View>
        <View style={styles.headerRightSide}>
          {list.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              disabled={clearAllMutation.isPending}
              style={({ pressed }) => [
                styles.clearAllButton,
                pressed && styles.pressed,
              ]}
            >
              <CustomText style={styles.clearAllText} numberOfLines={1}>
                {t('notifications.clearAll')}
              </CustomText>
            </Pressable>
          )}
        </View>
      </View>
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
    headerContainer: {
      paddingHorizontal: 20,
    },
    notificationHeader: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      backgroundColor: theme.colors.background,
    },
    headerBackButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 2,
    },
    headerTitleWrapper: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 120,
    },
    headerTitle: {
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(16),
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
    headerRightSide: {
      minWidth: 110,
      alignItems: 'flex-end',
      zIndex: 2,
    },
    clearAllButton: {
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    clearAllText: {
      fontFamily: theme.fonts.SEMI_BOLD,
      fontSize: theme.SF(14),
      color: theme.colors.text,
    },
    pressed: {
      opacity: 0.7,
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
