import { View, FlatList, StyleSheet } from 'react-native'
import React, { useState, useMemo } from 'react'
import { Container,  ChatHeader, ChatInput } from '@components';
import ActionMenu, { ActionMenuItem } from '@components/chat/ActionMenu';
import RatingDialog from '@components/chat/RatingDialog';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText } from '@components/common';
import { useTranslation } from 'react-i18next';
import imagePaths from '@assets';
import { SH } from '@utils/dimensions';
import { ChatListItemData } from '@components/chat/ChatListItem';
import ChatMessage, { ChatMessageData } from '@components/chat/ChatMessage';



const chatMessages: ChatMessageData[] = [
    {
        id: '1',
        text: 'Hi Amelia',
        timestamp: '7:12 pm',
        isOwn: false,
        image: imagePaths.recomanded1,
    },
    {
        id: '2',
        text: "I'm Fine",
        timestamp: '7:12 pm',
        isOwn: true,
    },
    {
        id: '3',
        text: 'And You',
        timestamp: '7:12 pm',
        isOwn: true,
    },
    {
        id: '4',
        text: 'How are you?',
        timestamp: '7:19 pm',
        isOwn: false,
        image: imagePaths.recomanded1,
    },
];

export default function ChatScreen() {
    const [selectedChat, setSelectedChat] = useState<ChatListItemData | null>(null);
    const [messages, setMessages] = useState<ChatMessageData[]>(chatMessages);
    const [showRatingDialog, setShowRatingDialog] = useState(false);
    const [showChatSettingsMenu, setShowChatSettingsMenu] = useState(false);

    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t } = useTranslation();

    
    const handleBackPress = () => {
        setSelectedChat(null);
    };

    const handleSendMessage = (message: string) => {
        const newMessage: ChatMessageData = {
            id: Date.now().toString(),
            text: message,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
            isOwn: true,
        };
        setMessages([...messages, newMessage]);
    };

 

    const chatSettingsMenuItems: ActionMenuItem[] = [
        {
            id: '1',
            label: t('chat.muteNotification'),
            icon: 'notifications-off-outline',
            onPress: () => {
                // Handle mute
            },
        },
        {
            id: '2',
            label: t('chat.deleteChat'),
            icon: 'trash-outline',
            onPress: () => {
                // Handle delete
            },
        },
        {
            id: '3',
            label: t('chat.rateClient'),
            icon: 'star-outline',
            onPress: () => {
                setShowChatSettingsMenu(false);
                setShowRatingDialog(true);
            },
        },
    ];

    const handleRatingSubmit = (rating: number, review: string) => {
        // Handle rating submission
        console.log('Rating:', rating, 'Review:', review);
    };

    return (
        <Container safeArea={true} style={styles.container}>
            <ChatHeader
                name={selectedChat?.name || 'Amelia'}
                lastSeen="5mins ago"
                time={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                image={selectedChat?.image}
                onBackPress={handleBackPress}
                onCallPress={() => { }}
                onOptionsPress={() => setShowChatSettingsMenu(true)}
            />
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatMessage message={item} />}
                contentContainerStyle={styles.messagesContent}
                ListHeaderComponent={
                    <View style={styles.dateSeparator}>
                        <CustomText style={styles.dateText}>{t('chat.today')}</CustomText>
                    </View>
                }
            />
            <ChatInput
                onSend={handleSendMessage}
                onCameraPress={() => { }}
                onAttachmentPress={() => { }}
            />
            <ActionMenu
                visible={showChatSettingsMenu}
                items={chatSettingsMenuItems}
                onClose={() => setShowChatSettingsMenu(false)}
            />
            <RatingDialog
                visible={showRatingDialog}
                onClose={() => setShowRatingDialog(false)}
                onSubmit={handleRatingSubmit}
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
