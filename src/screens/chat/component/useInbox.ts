import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, get } from '@react-native-firebase/database';
import { ExtendedChatUser } from '../../../utils';

export const useInboxUsers = (userId: string) => {
  const [inboxUsers, setInboxUsers] = useState<ExtendedChatUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [blockedUserIds, setBlockedUserIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const blockedUsersRef = ref(db, `/users/${userId}/blockedUsers`);

    const unsubscribe = onValue(blockedUsersRef, (snapshot) => {
      const blocked = snapshot.val() || {};
      setBlockedUserIds(blocked);
    });

    return () => unsubscribe(); // ✅ Clean up listener
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const inboxRef = ref(db, `/users/${userId}/myInbox`);

    const unsubscribe = onValue(inboxRef, async (snapshot) => {
      const inbox = snapshot.val();

      if (!inbox) {
        setInboxUsers([]);
        setLoading(false);
        return;
      }

      const userIds = Object.keys(inbox);
      const usersData: ExtendedChatUser[] = [];

      for (const otherUserId of userIds) {
        try {
          const userSnap = await get(ref(db, `/users/${otherUserId}`));
          const lastMsg = inbox[otherUserId]?.lastMessage || null;
          const timestamp = inbox[otherUserId]?.timestamp || null;

          if (userSnap.exists()) {
            const user = userSnap.val();
            const isBlocked = !!blockedUserIds[otherUserId];

            usersData.push({
              ...user,
              userId: otherUserId,
              lastMessage: lastMsg,
              timestamp,
              isBlocked,
            });
          }
        } catch (e) {
          console.error('Error fetching user:', otherUserId, e);
        }
      }

      usersData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setInboxUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe(); // ✅ Clean up listener
  }, [userId, blockedUserIds]);

  return {
    inboxUsers,
    loading,
  };
};
