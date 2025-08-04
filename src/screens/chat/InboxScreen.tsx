import React, { useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  AppText,
  BottomBar,
  Container,
  ImageLoader,
  VectoreIcons,
} from '../../component';
import {
  Colors,
  Fonts,
  SF,
  SH,
  SW,
  formatChatTimestamp,
  imagePaths,
  useDisableGestures,
} from '../../utils';
import { useNavigation } from '@react-navigation/native';
import RouteName from '../../navigation/RouteName';
import { ChatContext } from '../ChatProvider';
import InboxDropdownMenu from './component/InboxDropdownMenu';
import { useInboxUsers } from './component/useInbox';

const { width } = Dimensions.get('window');

const InboxScreen = () => {


  useDisableGestures();
  const navigation = useNavigation<any>();

  const {userData, toggleBlockUser } = useContext(ChatContext)!;
  const { inboxUsers, loading, } = useInboxUsers(userData?.userId || '');


  const btnNavigateMessageScreen = (item: any) => {
    let otheruser = {
      "chat_room_id": item?.chat_room_id,
      "email": item?.email,
      "fcmToken": item?.fcmToken,
      "image": item?.image,
      "mobileNo": item?.mobileNo,
      "name": item?.name,
      "notificationStatus": item?.notificationStatus,
      "onlineStatus": item?.onlineStatus,
      "roleType": item?.roleType,
      "userId": item?.userId
    }
    navigation.navigate(RouteName.MESSAGE_SCREEN, {
      otherDetails: otheruser,
      myDetails: userData,
    });
  }

  console.log('inboxUsers', inboxUsers);

  const onPressMenuOption = (type: string, oUser: any = null) => {
    console.log(type, 'typetype');
    switch (type) {
      case 'delete':
        // Handle mute
        break;
      case 'report':
        // Handle Report
        break;
      case 'block':
        blockUnblockUser(oUser)
        break;
    }
  }

  const blockUnblockUser = (oUser: any) => {
    userData?.userId && toggleBlockUser(userData?.userId, oUser.userId, !oUser?.isBlocked || false)
    // userData?.userId && toggleBlockUser(oUser.userId,userData?.userId,  true)
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemRow}>
      <TouchableOpacity
        style={styles.itemRow1}
        onPress={() => {
          btnNavigateMessageScreen(item)
        }}
      >
        <View style={styles.avatarContainer}>
          <ImageLoader
            source={{ uri: item.image || imagePaths.defaultUser }}
            mainImageStyle={styles.avatar}
          />
        </View>
        <View style={styles.alignStart}>
          <AppText style={styles.name}>{item.name}</AppText>
          <AppText style={styles.lastMessage}>{typeof item.lastMessage === 'string'
            ? item.lastMessage
            : item.lastMessage?.text || 'No messages yet'}</AppText>
          {item.timestamp && <AppText style={styles.time}>
            <VectoreIcons icon='MaterialCommunityIcons' name="clock-outline" size={SF(12)} color="#787878" /> {formatChatTimestamp(item.timestamp)}
          </AppText>}
        </View>
      </TouchableOpacity>

      <View style={{ marginTop: SH(10) }}>
        <InboxDropdownMenu
          isBlocked={item.isBlocked}
          onSelect={(val) => {
            onPressMenuOption(val, item)
          }} />
      </View>
    </View>
  );

  return (
    <Container>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <AppText style={styles.header}>Chat</AppText>
        </View>
        {loading ? <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.themeColor} />
        </View>
          :
          <FlatList
            data={inboxUsers || []}
            contentContainerStyle={{ paddingBottom: SH(90) }}
            keyExtractor={(item) => item?.userId + 'inbox'}
            renderItem={renderItem}
            ListEmptyComponent={<AppText style={styles.header}>No messages yet</AppText>}
          />
        }
      </View>
      <BottomBar activeTab={RouteName.INBOX_SCREEN} />
    </Container>
  );
};

export default InboxScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#fff',
    paddingHorizontal: SF(15),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SF(16),
  },
  header: {
    fontSize: SF(16),
    textAlign: 'center',
    fontFamily: Fonts.SEMI_BOLD,
    marginVertical: SH(15),
    marginLeft: SW(18),
  },
  itemRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    position: 'relative',
    padding: 14,
    justifyContent: 'space-between',
  },
  itemRow1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    height: SF(60),
    width: SF(60),
    borderRadius: SF(30),
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    color: Colors.textAppColor,
  },
  lastMessage: {
    fontSize: SF(10),
    color: Colors.textAppColor,
    fontFamily: Fonts.REGULAR,
    marginTop: 2,
  },
  time: {
    fontSize: SF(10),
    color: '#787878',
    marginTop: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: '100%',
    zIndex: 10,
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
