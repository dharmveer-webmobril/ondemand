import { View, FlatList, StyleSheet } from 'react-native'
import React, { useState, useMemo } from 'react'
import { Container, AppHeader } from '@components';
import ActionMenu, { ActionMenuItem } from '@components/chat/ActionMenu';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import imagePaths from '@assets';
import { SH } from '@utils/dimensions';
import ChatListItem, { ChatListItemData } from '@components/chat/ChatListItem';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';

// Mock data
const recentChats: ChatListItemData[] = [
  {
    id: '1',
    name: 'Jerry Walker',
    lastMessage: 'Hi last chat here',
    timestamp: '4:14 pm',
    image: imagePaths.recomanded1,
  },
  {
    id: '2',
    name: 'Sharon Young',
    lastMessage: 'Hi last chat here',
    timestamp: '4:14 pm',
    image: imagePaths.recomanded1,
  },
  {
    id: '3',
    name: 'Party Group',
    lastMessage: 'Hi last chat here',
    timestamp: '4:14 pm',
    image: imagePaths.recomanded1,
    isGroup: true,
  },
];


export default function InboxScreen() {
  const [showListItemMenu, setShowListItemMenu] = useState(false);
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleChatPress = (chat: ChatListItemData) => {
    navigate(SCREEN_NAMES.CHAT_SCREEN, { chat: chat.id });
  };


  const chatListItemMenuItems: ActionMenuItem[] = [
    {
      id: '1',
      label: 'Delete Chat',
      icon: 'trash-outline',
      onPress: () => {
        // Handle delete chat
      },
    },
    {
      id: '2',
      label: 'Report',
      icon: 'warning-outline',
      onPress: () => {
        // Handle report
      },
    },
    {
      id: '3',
      label: 'Block',
      icon: 'remove-circle-outline',
      onPress: () => {
        // Handle block
      },
    },
  ];

  // Recent Chats List View
  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title="Chat"
        rightIconName="search-outline"
        rightIconFamily="Ionicons"
        onRightPress={() => { }}
      />
      <View style={styles.recentHeader}>
        <CustomText style={styles.recentText}>Recent</CustomText>
      </View>
      <FlatList
        data={recentChats}
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
            <CustomText style={styles.emptyText}>No recent chats</CustomText>
          </View>
        }
      />
      <ActionMenu
        visible={showListItemMenu}
        items={chatListItemMenuItems}
        onClose={() => {
          setShowListItemMenu(false);
        }}
      />
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
});
