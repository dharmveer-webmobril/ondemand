import { useEffect, useState } from 'react';
import database, { FirebaseDatabaseTypes } from '@react-native-firebase/database';

// Define your Message interface
export interface Message {
  text: string;
  createdAt: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export const useChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const ref = database().ref(`messages/${chatId}`);

    const handleData = (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: Message[] = Object.keys(data)
          .map((key) => data[key] as Message)
          .sort((a, b) => b.createdAt - a.createdAt); // Latest first
        setMessages(parsed);
      } else {
        setMessages([]);
      }
    };

    ref.on('value', handleData);

    return () => ref.off('value', handleData);
  }, [chatId]);

  const clearMessages = async () => {
    await database().ref(`messages/${chatId}`).remove();
    // listener auto-clears the messages
  };

  return { messages, clearMessages };
};
