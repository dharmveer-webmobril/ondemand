import { useCallback } from 'react';
import database from '@react-native-firebase/database';
import { Alert } from 'react-native';
import { messageUser } from '../../../utils';

export const useSendMessage = () => {
  const sendMessage = useCallback(
    async (senderId: string, receiverId: string, message: string, senderInfo: messageUser) => {
      try {
        const dbRef = database();
        const chatId1 = `${senderId}_${receiverId}`;
        const chatId2 = `${receiverId}_${senderId}`;
        const timestamp = Date.now();

        // 🔒 Block Check
        const senderBlockedSnap = await dbRef.ref(`users/${senderId}/blockedUsers/${receiverId}`).once('value');
        if (senderBlockedSnap.exists()) {
          Alert.alert('Blocked', `You have blocked ${receiverId}`);
          return;
        }

        const receiverBlockedSnap = await dbRef.ref(`users/${receiverId}/blockedUsers/${senderId}`).once('value');
        if (receiverBlockedSnap.exists()) {
          Alert.alert('Blocked', `You are blocked by ${receiverId}`);
          return;
        }

        // ✅ Message Object
        const messageData = {
          text: message,
          createdAt: timestamp,
          user: senderInfo,
        };

        // 📤 Push to both paths
        await dbRef.ref(`messages/${chatId1}`).push().set(messageData);
        await dbRef.ref(`messages/${chatId2}`).push().set(messageData);

        // ✅ Update Inbox with full lastMessage object
        const inboxData = {
          lastMessage: messageData,
          timestamp,
        };

        await dbRef.ref(`users/${senderId}/myInbox/${receiverId}`).update(inboxData);
        await dbRef.ref(`users/${receiverId}/myInbox/${senderId}`).update(inboxData);
      } catch (error) {
        console.error('SendMessage Error:', error);
      }
    },
    []
  );

  return { sendMessage };
};
