import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import database, { get, getDatabase, ref, update } from '@react-native-firebase/database';
import { ChatUser } from '../utils';

// Types
interface Chat {
  id: string;
  members: string[];
  lastMessage?: string;
  timestamp?: number;
}

export interface messageUser {
  userId: string | number;
  name: string;
}

export interface Message {
  _id: any;
  key?: string;
  createdAt: Date;
  text: string;
  user: messageUser;
}

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  loading: boolean;
  allUsers: ChatUser[];
  userData: ChatUser | null;
  fetchMessages: (chatId: string, timeStamp: any) => Promise<() => void>;
  createUser: (userId: string, userObject: any) => void;
  createUserInbox: (obj: any, id: any, otherUserId: any) => void;
  sendMessage: (messageId: string, messageJson: any) => void;
  fetchAllUsers: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<ChatUser | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch messages with optional pagination
  const fetchMessages = useCallback(
    async (chatId: string, lastMessageKey: any | null = null): Promise<() => void> => {
      const dbRef = database().ref(`/messages/${chatId}`);
      let query = dbRef.orderByChild('createdAt').limitToLast(25);

      if (lastMessageKey) {
        query = dbRef.orderByChild('createdAt').endAt(lastMessageKey).limitToLast(25);
      }

      const seenMessageKeys = new Set<string>();

      const snapshot = await query.once('value');

      if (snapshot.exists()) {
        let messagesArray = Object.entries(snapshot.val() || {}).map(
          ([key, value]: any) => ({
            ...value,
            key,
          }),
        );

        messagesArray.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        if (lastMessageKey) {
          messagesArray.pop(); // Remove duplicate message
          setMessages(prev => {
            const unique = messagesArray.filter(
              msg => !prev.some(p => p.key === msg.key)
            );
            return [...prev, ...unique];
          });
        } else {
          setMessages(messagesArray);
        }

        messagesArray.forEach(msg => seenMessageKeys.add(msg.key));
      }

      // Real-time new message listener
      const onNewMessage = (snapshot: any) => {
        const newMessage = { ...snapshot.val(), key: snapshot.key };
        if (!seenMessageKeys.has(newMessage.key)) {
          setMessages(prev => [newMessage, ...prev]);
          seenMessageKeys.add(newMessage.key);
        }
      };

      dbRef.limitToLast(1).on('child_added', onNewMessage);

      // Cleanup function
      return () => {
        dbRef.off('child_added', onNewMessage);
      };
    },
    [],
  );

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    const db = getDatabase();
    const dbRef = ref(db, '/users/');
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        setAllUsers(users ? Object.values(users) : []);
      } else {
        console.log('No users found');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSingleUser = useCallback(
    async (userID: string): Promise<ChatUser | null> => {
      const snapshot = await database().ref(`/users/${userID}`).once('value');
      return snapshot.exists() ? snapshot.val() : null;
    },
    [],
  );

  const createUser = useCallback(async (userId: string, userObject: any) => {
    const userData: ChatUser = {
      name: userObject.name,
      email: userObject.email,
      image: userObject.image || '', // updated
      mobileNo: userObject.mobileno,
      onlineStatus: true, // changed to boolean
      fcmToken: userObject.fcmToken || '',
      userId,
      userType: userObject.userType,
      notificationStatus: '',
      chat_room_id: 'no',
      loginType: '',
    };

    const db = getDatabase();

    try {
      await update(ref(db, `users/${userId}`), userData);
      setUserData(userData);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const createUserInbox = useCallback(
    (res: any, userId: any, otherUserId: any) => {
      database().ref(`users/${userId}/myInbox/${otherUserId}`).update(res);
    },
    [],
  );

const sendMessage = useCallback(async (messageId: string, messageJson: any) => {
  try {
    await database()
      .ref(`messages/${messageId}`)
      .push()
      .set(messageJson);
  } catch (error) {
    console.error('SendMessage Error:', error);
  }
}, []);


  const chatContextValue = useMemo(
    () => ({
      chats,
      messages,
      loading,
      allUsers,
      userData,
      createUser,
      fetchMessages,
      createUserInbox,
      sendMessage,
      fetchAllUsers,
    }),
    [
      chats,
      messages,
      loading,
      allUsers,
      userData,
      fetchMessages,
      createUserInbox,
      sendMessage,
      fetchAllUsers,
    ],
  );

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
};
