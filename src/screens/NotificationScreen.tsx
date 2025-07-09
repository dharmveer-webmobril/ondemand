import React, { FC } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SectionList } from 'react-native';
import { Colors, Fonts, SH, SW, SF } from '../utils';
import imagePaths from '../assets/images';
import { AppHeader, AppText, Container } from '../component';
import { useNavigation } from '@react-navigation/native';

// Sample data for notifications
const DATA = [
    {
        title: 'Today',
        data: [
            {
                id: '1',
                icon: imagePaths.user, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '2',
                icon: imagePaths.user1, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '3',
                icon: imagePaths.user2, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
        ],
    },
    {
        title: 'Yesterday',
        data: [
            {
                id: '4',
                icon: imagePaths.user1, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '5',
                icon: imagePaths.user, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '6',
                icon: imagePaths.user2, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
        ],
    },
];

const notificationData = [
    {
        title: 'Today',
        data: [
            {
                id: '1',
                icon: imagePaths.user, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '2',
                icon: imagePaths.user1, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '3',
                icon: imagePaths.user2, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
        ],
    },
    {
        title: 'Yesterday',
        data: [
            {
                id: '4',
                icon: imagePaths.user1, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '5',
                icon: imagePaths.user, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
            {
                id: '6',
                icon: imagePaths.user2, // Replace with your image path
                message: 'Office ipsum you must be muted. Baseline cob canatics strategy and giant stand dear.',
                time: '2 hours Ago',
            },
        ],
    },
];

// Interface for notification item
interface NotificationItem {
    id: string;
    icon: any; // Replace with proper type if using TypeScript for images
    message: string;
    time: string;
}

// Interface for section
interface NotificationSection {
    title: string;
    data: NotificationItem[];
}

// Interface for props
interface NotificationScreenProps { }

// Notification Item Component
const NotificationItem: FC<{ item: NotificationItem }> = ({ item }) => {
    return (
        <View style={styles.notificationItem}>
            <Image source={item.icon} style={styles.icon} />
            <View style={styles.textContainer}>
                <AppText style={styles.message}>{item.message}</AppText>
                <AppText style={styles.time}>{item.time}</AppText>
            </View>
        </View>
    );
};

// Main NotificationScreen Component
const NotificationScreen: FC<NotificationScreenProps> = () => {
    const navigation = useNavigation<any>();
    return (
        <Container style={styles.container}>
            <AppHeader
                headerTitle={'Notifications'}
                onPress={() => {
                    navigation.goBack();
                }}
                Iconname="arrowleft"
                rightOnPress={() => { }}
            />
            <SectionList
                sections={DATA}
                keyExtractor={(item, index) => item.time + index}
                renderItem={({ item }) => (
                    <NotificationItem item={item} />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <AppText style={styles.sectionHeader}>{title}</AppText>
                )}
            />
        </Container>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: SW(20),
    },
    headerTitle: {
        fontSize: SF(24),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.black,
        textAlign: 'center',
        marginBottom: SH(20),
    },
    sectionHeader: {
        fontSize: SF(14),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
        marginVertical: SH(10),
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SH(10),
    },
    icon: {
        width: SW(40),
        height: SW(40),
        borderRadius: SW(20),
        marginRight: SW(10),
    },
    textContainer: {
        flex: 1,
    },
    message: {
        fontSize: SF(12),
        fontFamily: Fonts.MEDIUM,
        color: Colors.textAppColor,
        lineHeight: SH(20),
    },
    time: {
        fontSize: SF(12),
        fontFamily: Fonts.REGULAR,
        color: '#66707A',
        marginTop: SH(5),
    },
    separator: {
        height: 1,
        backgroundColor: Colors.lightGray,
        marginVertical: SH(5),
    },
});

export default NotificationScreen;