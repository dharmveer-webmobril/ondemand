import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
// import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import database, { get, getDatabase, ref, update } from '@react-native-firebase/database';
import { Alert } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { ChatUser } from '../utils';

// Types
interface Chat {
  id: string;
  members: string[];
  lastMessage?: string;
  timestamp?: number;
}

export interface messageUser {
  userId: string|number;
  name: string;
}
export interface Message {
  _id: any;
  createdAt: string|Date|null;
  text: string;
  user: messageUser
}


interface ChatContextType {
  // user: FirebaseAuthTypes.User | null;
  chats: Chat[];
  messages: Message[];
  loading: boolean;
  allUsers: ChatUser[];
  userData: ChatUser | null;
  fetchMessages: (chatId: string, timeStamp: any) => void;
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


  const fetchMessages = useCallback(
    async (chatId: string, lastMessageKey: any | null = null) => {
      console.log('chatIdchatId', chatId);

      let messagesRef = database()
        .ref(`/messages/${chatId}`)
        .orderByChild('createdAt')
        .limitToLast(25);

      if (lastMessageKey) {
        messagesRef = database()
          .ref(`/messages/${chatId}`)
          .orderByChild('createdAt')
          .endAt(lastMessageKey)
          .limitToLast(25);
      }



      // Track seen messages to prevent duplicates
      let seenMessageKeys = new Set();

      messagesRef.once('value', snapshot => {
        if (snapshot.exists()) {
          let messagesArray = Object.entries(snapshot.val() || {}).map(
            ([key, value]: any) => ({
              ...value,
              key: key,
            }),
          );

          messagesArray.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          if (lastMessageKey) {
            messagesArray.pop(); // Remove duplicate last message
            setMessages(prevMessages => {
              const uniqueMessages = messagesArray.filter(
                msg => !prevMessages.some((pMsg: any) => pMsg.key === msg.key)
              );
              return [...prevMessages, ...uniqueMessages];
            });
          } else {
            setMessages(messagesArray);
          }

          // Store seen message keys
          messagesArray.forEach(msg => seenMessageKeys.add(msg.key));

          console.log('--messagesArray--', messagesArray);
        }
      });

      // Real-time listener for new messages
      const messagesRef1 = database().ref(`/messages/${chatId}`);

      const onNewMessage = (snapshot: any) => {
        const newMessage = { ...snapshot.val(), key: snapshot.key };

        // Check if the message is already in the list
        if (!seenMessageKeys.has(newMessage.key)) {
          setMessages(prevMessages => [newMessage, ...prevMessages]);
          seenMessageKeys.add(newMessage.key); // Mark it as seen
        }
      };

      messagesRef1.limitToLast(1).on('child_added', onNewMessage);

      return () => {
        messagesRef.off();
        messagesRef1.off('child_added', onNewMessage); // Proper cleanup
      };
    },
    [],
  );


  // Fetch All Users (Optimized)
  const fetchAllUsers = useCallback(async () => {
    const db = getDatabase();
    const dbRef = ref(db, '/users/');
    try {
      const snapshot = await get(dbRef);
      console.log('snapshot', snapshot);
      if (snapshot.exists()) {
        setAllUsers(snapshot.val() ? Object.values(snapshot.val()) : []);
      } else {
        console.log('No data available');
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Get Single User Details
  const getSingleUser = useCallback(
    async (userID: string): Promise<ChatUser | null> => {
      const snapshot = await database().ref(`/users/${userID}`).once('value');
      return snapshot.exists() ? snapshot.val() : null;
    },
    [],
  );

  // Create New User in Database
  const createUser = useCallback(async (userId: string, userObject: any) => {
    const userData: ChatUser = {
      name: userObject.name,
      email: userObject.email,
      image: 'image',
      mobileNo: userObject.mobileno,
      onlineStatus: 'true',
      fcmToken: 'player_id_me',
      userId,
      userType: userObject.userType,
      notificationStatus: '',
      chat_room_id: 'no',
      loginType: '',
    };
    const db = getDatabase();
    console.log('userData', userData);
    console.log('db', db);

    try {
      await update(ref(db, `users/${userId}`), userData);
      setUserData(userData)
    } catch (error) {
      console.error(error);
    }

  }, []);

  // Create User Inbox
  const createUserInbox = useCallback(
    (res: any, userId: any, otherUserId: any) => {
      database().ref(`users/${userId}/myInbox/${otherUserId}`).update(res);
    },
    [],
  );

  // Send Message
  const sendMessage = useCallback((messageId: string, messageJson: any) => {
    database()
      .ref(`messages/${messageId}`)
      .push()
      .set(messageJson)
      .catch(error => console.error('SendMessage Error:', error));
  }, []);



  // Memoized Context Value
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
