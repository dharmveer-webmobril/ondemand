import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, } from '@components';
import { useSelector } from 'react-redux';

import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import imagePaths from '@assets';
import { SH } from '@utils/dimensions';
import ChatListItem, { ChatListItemData } from '@components/chat/ChatListItem';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { useGetConversations, Conversation } from '@services/index';
import { useSocket } from '@services/socket/SocketProvider';


/**
 * Format timestamp to readable time
 */
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // This week - show day name
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      // Older - show date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  } catch {
    return '';
  }
};

/**
 * Map conversation to ChatListItemData
 */
const mapConversationToChatListItem = (
  conversation: Conversation,
  currentUserId: string | null
): ChatListItemData => {
  // Determine which participant to show (the other person, not current user)
  const isCurrentUserParticipantOne = conversation.participantOne._id === currentUserId;
  const otherParticipant = isCurrentUserParticipantOne
    ? conversation.participantTwo
    : conversation.participantOne;

  // Get unread count based on which participant is current user
  const unreadCount = isCurrentUserParticipantOne
    ? conversation.participantOneUnreadCount
    : conversation.participantTwoUnreadCount;

  return {
    id: conversation._id,
    name: otherParticipant.name || conversation.chatTitle || 'Unknown',
    lastMessage: conversation.lastMessage || '',
    timestamp: formatTimestamp(conversation.lastMessageTime),
    image: otherParticipant.profileImage
      ? { uri: otherParticipant.profileImage }
      : imagePaths.recomanded1,
    // Store additional data for navigation
    conversationId: conversation._id,
    bookingId: conversation.bookingId?._id || conversation.bookingId?.bookingId,
    unreadCount,
  } as ChatListItemData & { conversationId: string; bookingId?: string; unreadCount: number };
};

export default function InboxScreen() {
  const { t } = useTranslation();
  const [_, setShowListItemMenu] = useState(false);
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Get current user ID from Redux store
  const currentUserId = useSelector((state: any) => state.auth.userId);

  // Fetch conversations
  const { data: conversationsData, isLoading, error, refetch } = useGetConversations(
    { page: 1, limit: 10 },
    !!currentUserId // Only fetch if user is authenticated
  );

  // Map conversations to ChatListItemData format
  const chatListItems = useMemo(() => {
    if (!conversationsData?.ResponseData || !currentUserId) {
      return [];
    }

    return conversationsData.ResponseData.map(conversation =>
      mapConversationToChatListItem(conversation, currentUserId)
    );
  }, [conversationsData, currentUserId]);

  const handleChatPress = (chat: ChatListItemData & { conversationId?: string; bookingId?: string }) => {
    navigate(SCREEN_NAMES.CHAT_SCREEN, {
      conversationId: chat.conversationId || chat.id,
      bookingId: (chat as any).bookingId,
    });
  };


  const { emit, on, off } = useSocket();

  useEffect(() => {
    getConversations(1)
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getConversations = React.useCallback((page: number = 1, limit: number = 101) => {
    if (emit) {
      emit('chat:get-conversations', {
        page: page,
        limit: limit,
      });
    }
  }, [emit]);

  useEffect(() => {
    const handler = (data: any) => {
      console.log('chat:conversations-response------', data);
    };
    on('chat:conversations-response', handler);
    return () => {
      off('chat:conversations-response', handler);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Recent Chats List View
  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('chat.title')}
        rightIconName="search-outline"
        rightIconFamily="Ionicons"
        onRightPress={() => { }}
        containerStyle={styles.headerContainer}
      />
      <View style={styles.recentHeader}>
        <CustomText style={styles.recentText}>Recent</CustomText>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>
            {t('chat.errorLoadingConversations') || 'Error loading conversations'}
          </CustomText>
        </View>
      ) : (
        <FlatList
          data={chatListItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              item={item}
              onPress={() => handleChatPress(item)}
              onOptionsPress={() => {
                setShowListItemMenu(true);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>
                {t('chat.noRecentChats') || 'No recent chats'}
              </CustomText>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

    </Container>
  );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F7F7F7',
  },
  recentHeader: {
    paddingHorizontal: theme.SW(20),
    paddingVertical: theme.SH(12),
    backgroundColor: theme.colors.white,
  },
  recentText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.BOLD,
  },
  listContent: {
    paddingBottom: SH(90),
  },
  messagesContent: {
    paddingBottom: theme.SH(20),
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: theme.SH(16),
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.SH(40),
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.lightText,
    fontFamily: theme.fonts.MEDIUM,
  },
  headerContainer: {
    paddingRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.SH(40),
  },
});
