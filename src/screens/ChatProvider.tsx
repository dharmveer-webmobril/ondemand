import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import database, {
  get,
  getDatabase,
  ref,
  update,
} from '@react-native-firebase/database';
import { Chat, ChatContextType, ChatUser, ExtendedChatUser, Message, messageUser } from '../utils';
import { Alert } from 'react-native';

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<ChatUser | null>(null);
  const [chats, _setChats] = useState<Chat[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [inboxUsers, setInboxUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unsubscribeMap, setUnsubscribeMap] = useState<Record<string, () => void>>({});

  // const fetchMessages = useCallback(
  //   async (chatId: string, lastMessageKey: any | null = null): Promise<void> => {
  //     if (activeChatId && unsubscribeMap[activeChatId]) {
  //       unsubscribeMap[activeChatId](); // cleanup previous listener
  //     }

  //     setActiveChatId(chatId);
  //     const dbRef = database().ref(`/messages/${chatId}`);
  //     let query = dbRef.orderByChild('createdAt').limitToLast(25);

  //     if (lastMessageKey) {
  //       query = dbRef.orderByChild('createdAt').endAt(lastMessageKey).limitToLast(25);
  //     }

  //     const seenMessageKeys = new Set<string>();
  //     const snapshot = await query.once('value');

  //     if (snapshot.exists()) {
  //       let messagesArray = Object.entries(snapshot.val() || {}).map(([key, value]: any) => ({
  //         ...value,
  //         key,
  //       }));

  //       messagesArray.sort(
  //         (a: any, b: any) =>
  //           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  //       );

  //       if (lastMessageKey) {
  //         messagesArray.pop();
  //         setMessagesMap(prev => {
  //           const currentMessages = prev[chatId] || [];
  //           const unique = messagesArray.filter(
  //             msg => !currentMessages.some(p => p.key === msg.key),
  //           );
  //           return { ...prev, [chatId]: [...currentMessages, ...unique] };
  //         });
  //       } else {
  //         setMessagesMap(prev => ({ ...prev, [chatId]: messagesArray }));
  //       }

  //       messagesArray.forEach(msg => seenMessageKeys.add(msg.key));
  //     }

  //     const onNewMessage = (messageSnapshot: any) => {
  //       const newMessage = { ...messageSnapshot.val(), key: messageSnapshot.key };
  //       if (!seenMessageKeys.has(newMessage.key)) {
  //         setMessagesMap(prev => {
  //           const current = prev[chatId] || [];
  //           return { ...prev, [chatId]: [newMessage, ...current] };
  //         });
  //         seenMessageKeys.add(newMessage.key);
  //       }
  //     };

  //     dbRef.limitToLast(1).on('child_added', onNewMessage);

  //     setUnsubscribeMap(prev => ({
  //       ...prev,
  //       [chatId]: () => dbRef.off('child_added', onNewMessage),
  //     }));
  //   },
  //   [activeChatId, unsubscribeMap],
  // );
  const fetchMessages = useCallback(
    async (chatId: string, lastMessageKey: any | null = null): Promise<void> => {
      // 👇 Always clear previous listener if any
      if (unsubscribeMap[chatId]) {
        unsubscribeMap[chatId]();
      }

      setActiveChatId(chatId);
      const dbRef = database().ref(`/messages/${chatId}`);
      let query = dbRef.orderByChild('createdAt').limitToLast(25);

      if (lastMessageKey) {
        query = dbRef.orderByChild('createdAt').endAt(lastMessageKey).limitToLast(25);
      }

      const seenMessageKeys = new Set<string>();
      const snapshot = await query.once('value');

      if (snapshot.exists()) {
        let messagesArray = Object.entries(snapshot.val() || {}).map(([key, value]: any) => ({
          ...value,
          key,
        }));

        messagesArray.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        if (lastMessageKey) {
          messagesArray.pop();
          setMessagesMap(prev => {
            const currentMessages = prev[chatId] || [];
            const unique = messagesArray.filter(
              msg => !currentMessages.some(p => p.key === msg.key),
            );
            return { ...prev, [chatId]: [...currentMessages, ...unique] };
          });
        } else {
          setMessagesMap(prev => ({ ...prev, [chatId]: messagesArray }));
        }

        messagesArray.forEach(msg => seenMessageKeys.add(msg.key));
      }

      // 👇 Track child_added separately to avoid duplicates
      const onNewMessage = (messageSnapshot: any) => {
        const newMessage = { ...messageSnapshot.val(), key: messageSnapshot.key };
        if (!seenMessageKeys.has(newMessage.key)) {
          setMessagesMap(prev => {
            const current = prev[chatId] || [];
            return { ...prev, [chatId]: [newMessage, ...current] };
          });
          seenMessageKeys.add(newMessage.key);
        }
      };

      dbRef.limitToLast(1).on('child_added', onNewMessage);

      setUnsubscribeMap(prev => ({
        ...prev,
        [chatId]: () => dbRef.off('child_added', onNewMessage),
      }));
    },
    [unsubscribeMap],
  );
  useEffect(() => {
    return () => {
      // 🔁 On unmount, remove all message listeners
      Object.values(unsubscribeMap).forEach(unsub => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    const dbRef = ref(getDatabase(), '/users/');
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        setAllUsers(users ? Object.values(users) : []);
      }
    } catch (error) {
      console.error('Fetch All Users Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userId: string, userObject: any) => {
    const userData1: ChatUser = {
      userId,
      name: userObject.name,
      email: userObject.email,
      image: userObject.image || '',
      mobileNo: userObject.mobileno,
      onlineStatus: true,
      fcmToken: userObject.fcmToken || '',
      roleType: userObject.roleType,
      notificationStatus: true,
      chat_room_id: 'no',
    };

    const db = getDatabase();

    try {
      await update(ref(db, `users/${userId}`), userData1);
      setUserData(userData1);
    } catch (error) {
      console.error('Create User Error:', error);
    }
  }, []);

  const createUserInbox = useCallback((inboxData: any, userId: string, otherUserId: string) => {
    database().ref(`users/${userId}/myInbox/${otherUserId}`).update(inboxData);
  }, []);


  // const sendMessage = useCallback(async (
  //   senderId: string,
  //   receiverId: string,
  //   message: string,
  //   senderInfo: messageUser
  // ) => {
  //   try {
  //     const db = getDatabase();
  //     const chatId1 = `${senderId}_${receiverId}`;
  //     const chatId2 = `${receiverId}_${senderId}`;
  //     const timestamp = Date.now();

  //     // 🔒 Block Check
  //     const senderBlockedSnap = await get(ref(db, `users/${senderId}/blockedUsers/${receiverId}`));
  //     if (senderBlockedSnap.exists()) {
  //       const nameSnap = await get(ref(db, `users/${receiverId}/name`));
  //       const receiverName = nameSnap.exists() ? nameSnap.val() : 'This user';
  //       Alert.alert('Blocked', `You have blocked ${receiverName}.`);
  //       return;
  //     }

  //     const receiverBlockedSnap = await get(ref(db, `users/${receiverId}/blockedUsers/${senderId}`));
  //     if (receiverBlockedSnap.exists()) {
  //       const nameSnap = await get(ref(db, `users/${receiverId}/name`));
  //       const receiverName = nameSnap.exists() ? nameSnap.val() : 'This user';
  //       Alert.alert('Blocked', `${receiverName} has blocked you.`);
  //       return;
  //     }

  //     // 📤 Send Message to both users
  //     const messageData = {
  //       text: message,
  //       createdAt: new Date().getTime(),
  //       user: senderInfo,
  //     };

  //     await database().ref(`messages/${chatId1}`).push().set(messageData);
  //     await database().ref(`messages/${chatId2}`).push().set(messageData);

  //     console.log('Message sent successfully');

  //     // 📥 Update Inbox for both users
  //     const inboxData = {
  //       lastMessage: message,
  //       timestamp,
  //     };

  //     await database().ref(`users/${senderId}/myInbox/${receiverId}`).update(inboxData);
  //     await database().ref(`users/${receiverId}/myInbox/${senderId}`).update(inboxData);

  //     console.log('Inbox updated successfully');

  //   } catch (error) {
  //     console.error('SendMessage Error:', error);
  //   }
  // }, [])
  const sendMessage = useCallback(
    async (
      senderId: string,
      receiverId: string,
      message: string,
      senderInfo: messageUser,
    ) => {
      try {
        const db = getDatabase();
        const chatId1 = `${senderId}_${receiverId}`;
        const chatId2 = `${receiverId}_${senderId}`;
        const timestamp = Date.now();
  
        const senderBlockedSnap = await get(ref(db, `users/${senderId}/blockedUsers/${receiverId}`));
        if (senderBlockedSnap.exists()) {
          Alert.alert('Blocked', `${receiverId} is blocked by you.`);
          return;
        }
  
        const receiverBlockedSnap = await get(ref(db, `users/${receiverId}/blockedUsers/${senderId}`));
        if (receiverBlockedSnap.exists()) {
          Alert.alert('Blocked', `You are blocked by ${receiverId}.`);
          return;
        }
  
        const messageData = {
          text: message,
          createdAt: timestamp,
          user: senderInfo,
        };
  
        // 👥 Save message
        await database().ref(`messages/${chatId1}`).push().set(messageData);
        await database().ref(`messages/${chatId2}`).push().set(messageData);
  
        // 📥 Update inbox
        const inboxData = {
          lastMessage: message,
          timestamp,
        };
        await database().ref(`users/${senderId}/myInbox/${receiverId}`).update(inboxData);
        await database().ref(`users/${receiverId}/myInbox/${senderId}`).update(inboxData);
  
        // ✅ Ensure listener is set
        if (!unsubscribeMap[chatId1]) {
          fetchMessages(chatId1); // this reattaches real-time updates
        }
  
      } catch (error) {
        console.error('SendMessage Error:', error);
      }
    },
    [unsubscribeMap, fetchMessages],
  );


  const getInboxUsers = useCallback(async (userId: string) => {
    try {
      const inboxRef = ref(getDatabase(), `/users/${userId}/myInbox`);
      const snapshot = await get(inboxRef);

      if (!snapshot.exists()) {
        setInboxUsers([]);
        return;
      }

      const inbox = snapshot.val();
      const userIds = Object.keys(inbox);
      const usersData: ExtendedChatUser[] = [];

      for (const otherUserId of userIds) {
        const userSnap = await get(ref(getDatabase(), `/users/${otherUserId}`));
        const lastMsg = inbox[otherUserId]?.lastMessage || null;
        const timestamp = inbox[otherUserId]?.timestamp || null;

        if (userSnap.exists()) {
          const user = userSnap.val();
          usersData.push({
            ...user,
            lastMessage: lastMsg,
            timestamp: timestamp,
          });
        }
      }

      usersData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setInboxUsers(usersData);
    } catch (err) {
      console.error('Error getting inbox users:', err);
      setInboxUsers([]);
    }
  }, []);


  const deleteChatForBothUsers = useCallback(
    async (userId: string, otherUserId: string) => {
      try {
        const db = database();
        const chatPath1 = `${userId}_${otherUserId}`;
        const chatPath2 = `${otherUserId}_${userId}`;

        // Delete both message paths
        await Promise.all([
          db.ref(`messages/${chatPath1}`).remove(),
          // db.ref(`messages/${chatPath2}`).remove(), // Optional: if you want both directions
        ]);

        // Remove messages from state
        setMessagesMap(prev => {
          const updated = { ...prev };
          delete updated[chatPath1];
          delete updated[chatPath2];
          return updated;
        });

        // Reset active chat if it's the one being deleted
        if (activeChatId === chatPath1 || activeChatId === chatPath2) {
          setActiveChatId(null);
        }

      } catch (error) {
        console.error('Full Delete Chat Error:', error);
      }
    },
    [activeChatId],
  );

  const toggleBlockUser = useCallback(async (userId: string, otherUserId: string, block: boolean) => {
    try {
      const refPath = `users/${userId}/blockedUsers/${otherUserId}`;
      if (block) {
        await database().ref(refPath).set(true);
      } else {
        await database().ref(refPath).remove();
      }
    } catch (error) {
      console.error('Toggle Block User Error:', error);
    }
  }, []);

  const muteBlockUser = useCallback(async (userId: string, otherUserId: string, block: boolean) => {
    try {
      const refPath = `users/${userId}/mutedUsers/${otherUserId}`;
      if (block) {
        await database().ref(refPath).set(true);
      } else {
        await database().ref(refPath).remove();
      }
    } catch (error) {
      console.error('Toggle Block User Error:', error);
    }
  }, []);

  const getUserMuteBlockStatus = useCallback(async (
    userId: string,
    otherUserId: string
  ): Promise<{ isBlocked: boolean; isMuted: boolean }> => {
    try {
      const db = getDatabase();

      const [blockSnap, muteSnap] = await Promise.all([
        get(ref(db, `users/${userId}/blockedUsers/${otherUserId}`)),
        get(ref(db, `users/${userId}/mutedUsers/${otherUserId}`)),
      ]);

      return {
        isBlocked: blockSnap.exists(),
        isMuted: muteSnap.exists(),
      };
    } catch (error) {
      console.error('getUserMuteBlockStatus Error:', error);
      return {
        isBlocked: false,
        isMuted: false,
      };
    }
  }, []);

  useEffect(() => {
    if (!userData?.userId) return;

    const userRef = database().ref(`/users/${userData.userId}`);
    const connectedRef = database().ref('.info/connected');

    const onConnectionChange = connectedRef.on('value', snapshot => {
      const isConnected = snapshot.val();
      if (!isConnected) return;

      userRef.child('onlineStatus').onDisconnect().set(false);
      userRef.child('lastSeen').onDisconnect().set(new Date().toISOString());

      userRef.child('onlineStatus').set(true);
    });

    return () => {
      connectedRef.off('value', onConnectionChange);
      userRef.child('onlineStatus').set(false);
      userRef.child('lastSeen').set(new Date().toISOString());
    };
  }, [userData?.userId]);

  const chatContextValue = useMemo(
    () => ({
      chats,
      messages: activeChatId ? messagesMap[activeChatId] || [] : [],
      loading,
      allUsers,
      inboxUsers,
      userData,
      createUser,
      fetchMessages,
      createUserInbox,
      sendMessage,
      fetchAllUsers,
      getInboxUsers,
      deleteChatForBothUsers,
      toggleBlockUser,
      muteBlockUser,
      getUserMuteBlockStatus
    }),
    [
      chats,
      messagesMap,
      activeChatId,
      loading,
      allUsers,
      inboxUsers,
      userData,
      createUser,
      fetchMessages,
      createUserInbox,
      sendMessage,
      fetchAllUsers,
      getInboxUsers,
      deleteChatForBothUsers,
      toggleBlockUser,
      muteBlockUser,
      getUserMuteBlockStatus
    ],
  );

  return <ChatContext.Provider value={chatContextValue}>{children}</ChatContext.Provider>;
};
