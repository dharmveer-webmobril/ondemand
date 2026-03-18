import imagePaths from '@assets';
import { ChatHeader } from '@components';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import {
  markConversationAsRead,
  useGetBookingChatDetails,
} from '@services/api/queries/chatQueries';
import { useSocket } from '@services/socket/SocketProvider';
import { store } from '@store/index';
import { goBack } from '@utils/NavigationUtils';
import { useKeyboardHeight } from '@utils/hooks/useKeyboardHeight';
import { useThemeContext } from '@utils/theme';
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function ChatScreen() {
  const route = useRoute<any>();
  const authState = store.getState().auth;
  const userDetails = authState.userDetails as {
    name?: string;
    profileImage?: string;
  } | null;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const totalPages = useRef<number>(1);
  const page = useRef<number>(1);
  const loadMoreLoader = useRef<boolean>(false);
  const MESSAGE_LIMIT = 15;
  const pendingPageRef = useRef<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [headerData, setHeaderData] = useState<any>(null);
  const conversationId = route.params?.conversationId || route.params?.chat;
  const bookingId = route.params?.bookingId;
  const currentUserId = store.getState().auth.userId ?? '';
  const { joinConversation, leaveConversation, emit, on, off } = useSocket();
console.log('conversationId------', conversationId);
console.log('bookingId------', bookingId);
  useEffect(() => {
    if (!conversationId || !bookingId) return;
    joinConversation(conversationId, bookingId);
    return () => {
      leaveConversation(conversationId, bookingId);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUser: User = {
    _id: currentUserId,
    name: userDetails?.name ?? 'Me',
    avatar: userDetails?.profileImage,
  };

  // const { data: bookingDetailData } = useGetSPBookingDetail(bookingId ?? '');
  const { data: chatBookingDetails } = useGetBookingChatDetails(
    bookingId ?? '',
  );
  useEffect(() => {
    if (chatBookingDetails?.ResponseData?.conversation) {
      if (
        chatBookingDetails?.ResponseData?.conversation?.participantTwoType ===
        'serviceProvider'
      ) {
        setHeaderData(
          chatBookingDetails?.ResponseData?.conversation?.participantTwo,
        );
      } else {
        setHeaderData(
          chatBookingDetails?.ResponseData?.conversation?.participantOne,
        );
      }
    }
  }, [chatBookingDetails]);

  const recieverId = useMemo(() => {
    if (
      chatBookingDetails?.ResponseData?.conversation?.participantTwoType ===
      'serviceProvider'
    ) {
      return chatBookingDetails?.ResponseData?.conversation?.participantTwo
        ?._id;
    } else {
      return chatBookingDetails?.ResponseData?.conversation?.participantOne
        ?._id;
    }
  }, [chatBookingDetails]);

  console.log('recieverId------', recieverId);

  const apiToGifted = useCallback((raw: any[]): IMessage[] => {
    if (!raw || !Array.isArray(raw)) return [];

    return [...raw].reverse().map(
      (msg: any): IMessage => ({
        _id: msg._id,
        text: msg.message || '',
        createdAt: new Date(msg.createdAt),
        user: {
          _id: msg.senderId,
          name: msg.senderName ?? '',
          avatar: msg.senderProfileImage || msg.senderDetails?.profileImage,
        },
      }),
    );
  }, []);

  const getMessages = useCallback(
    (targetPage: number) => {
      if (!conversationId || !bookingId || !emit) return false;
      emit('chat:get-messages', {
        conversationId,
        bookingId,
        page: targetPage,
        limit: MESSAGE_LIMIT,
      });
      return true;
    },
    [conversationId, bookingId, emit],
  );

  const loadMessages = useCallback(
    (targetPage: number) => {
      if (!conversationId) return;

      const isInitial = targetPage === 1;
      if (isInitial) {
        setLoadingInitial(true);
      } else {
        setIsLoadingMore(true);
        loadMoreLoader.current = true;
      }
      pendingPageRef.current = targetPage;
      getMessages(targetPage);
    },
    [conversationId, getMessages],
  );

  // Listen for socket messages-response: apply to state and clear loading
  useEffect(() => {
    const handler = (data: any) => {
      const targetPage = pendingPageRef.current;
      if (targetPage == null) return;

      const rawList =
        data?.ResponseData ?? data?.data ?? (Array.isArray(data) ? data : []);
      const newMsgs = apiToGifted(rawList);
      const pagination = data?.pagination;
      const pages = pagination?.pages ?? 1;
      totalPages.current = pages;
      page.current = targetPage;
      pendingPageRef.current = null;

      if (targetPage === 1) {
        setMessages(newMsgs);
        setLoadingInitial(false);
      } else {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m._id));
          const toAppend = newMsgs.filter(m => !existingIds.has(m._id));
          return [...prev, ...toAppend];
        });
        loadMoreLoader.current = false;
        setIsLoadingMore(false);
      }
    };
    on('chat:messages-response', handler);
    return () => off('chat:messages-response', handler);
  }, [on, off, apiToGifted]);

  useEffect(() => {
    if (conversationId && bookingId) loadMessages(1);
  }, [conversationId, bookingId, loadMessages]);

  // Mark conversation as read when screen is focused and messages are loaded
  useFocusEffect(
    React.useCallback(() => {
      if (conversationId && messages.length > 0 && !loadingInitial) {
        markConversationAsRead(conversationId).catch(error => {
          console.error('Failed to mark conversation as read:', error);
        });
      }
    }, [conversationId, messages.length, loadingInitial]),
  );

  const handleLoadOlder = useCallback(() => {
    if (loadMoreLoader.current || page.current >= totalPages.current) return;
    const nextPage = page.current + 1;
    loadMessages(nextPage);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (!newMessages?.length || !conversationId || !bookingId) return;

      const text = newMessages[0].text?.trim();
      if (!text) return;

      // Optimistic update: show message immediately
      setMessages(prev => GiftedChat.append(prev, newMessages));

      // recieverId may still be loading on first mount; use current value
      const receiverId = recieverId;
      if (!receiverId) {
        console.warn(
          '[Chat] receiverId not loaded yet, message may not be delivered',
        );
      }

      const payload = {
        conversationId,
        bookingId,
        receiverId,
        receiverType: 'serviceProvider',
        message: text,
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };
      console.log('payload------', payload);
      emit('chat:send-message', payload);
    },
    [conversationId, bookingId, recieverId, emit],
  );

  useEffect(() => {
    const handler = (data: any) => {
      console.log('chat:new-message------', data);
      setMessages(prev => {
        const formatted = {
          _id: data._id ?? data.messageId,
          text: data.message ?? data.text,
          createdAt: new Date(data.createdAt || Date.now()),
          user: {
            _id: data.senderId,
            name: data.senderName ?? '',
            avatar: data.senderProfileImage || data.senderDetails?.profileImage,
          },
        };

        // Already have this message (same server id)
        if (prev.some(m => m._id === formatted._id)) return prev;

        const isOwnMessage = data.senderId === currentUserId;

        if (isOwnMessage) {
          // Replace single optimistic message: remove one same-text from current user, then add server version
          const optimisticIndex = prev.findIndex(
            m =>
              String(m.user._id) === currentUserId &&
              m.text === formatted.text &&
              m._id !== formatted._id,
          );
          const withoutOptimistic =
            optimisticIndex === -1
              ? prev
              : prev.filter((_, i) => i !== optimisticIndex);
          return GiftedChat.append(withoutOptimistic, [formatted]);
        }

        // Mark conversation as read when receiving a new message from the other person
        if (conversationId && !isOwnMessage) {
          markConversationAsRead(conversationId).catch(error => {
            console.error('Failed to mark conversation as read:', error);
          });
        }

        return GiftedChat.append(prev, [formatted]);
      });
    };

    on('chat:new-message', handler);

    return () => {
      off('chat:new-message', handler);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingInitial && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }
  const insets = useSafeAreaInsets();
  const theme = useThemeContext();
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
     
      <View style={[styles.contentContainer]}>
        <ChatHeader
          name={headerData?.name || ''}
          lastSeen=""
          bookingId={
            chatBookingDetails?.ResponseData?.conversation?.bookingId
              ?.bookingId || ''
          }
          image={
            headerData?.profileImage
              ? { uri: headerData?.profileImage }
              : imagePaths.no_user_img
          }
          onBackPress={() => {
            goBack();
          }}
          onCallPress={() => {}}
          onOptionsPress={() => {}}
        />
        <View style={styles.chatContainer}>
          <GiftedChat
            messages={messages}
            user={currentUser}
            onSend={onSend}
            isInverted={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#999" />
                <Text style={styles.loadingSubText}>Loading chat...</Text>
              </View>
            )}
            keyboardAvoidingViewProps={{
              keyboardVerticalOffset: insets.bottom + theme.SH(90),
            }}
            listProps={{
              contentContainerStyle: {
                flexGrow: 1,
                justifyContent: 'flex-start',
              },
              keyboardShouldPersistTaps: 'never',
              onEndReached: handleLoadOlder,
              onEndReachedThreshold: 0.5,
              scrollEventThrottle: 16,
              ListFooterComponent: isLoadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.footerText}>
                    Loading older messages...
                  </Text>
                </View>
              ) : page.current >= totalPages.current && messages.length > 0 ? (
                <View style={styles.footerLoader}>
                  <Text style={styles.beginningText}>
                    Beginning of conversation
                  </Text>
                </View>
              ) : null,
              initialNumToRender: 15,
              windowSize: 11,
              maxToRenderPerBatch: 10,
            }}
            textInputProps={{
              placeholder: 'Type a message...',
              style: { fontSize: 16 },
            }}
            isScrollToBottomEnabled={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#555',
  },
  loadingSubText: {
    marginTop: 8,
    color: '#666',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 12,
    color: '#777',
  },
  beginningText: {
    color: '#aaa',
    padding: 16,
  },
});
