import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText, Container, ImageLoader, Spacing, VectoreIcons } from '../../component';
import { chatMenuData, Colors, Fonts, imagePaths, SF, SH, SW } from '../../utils';
import ChatDropdownMenu from './component/ChatDropdownMenu';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChatContext, Message, messageUser } from '../ChatProvider';
// import ChatHeader from './component/ChatHeader';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';


const MessageScreen: React.FC = () => {
  const route = useRoute<any>();
  let { otherDetails, myDetails } = route?.params;
  console.log('myDetails-', myDetails, 'otherDetails-', otherDetails);

  const chatContext = useContext(ChatContext);
  if (!chatContext) return null;

  const { sendMessage, fetchMessages, messages, createUserInbox } = chatContext;
  const navigation = useNavigation();

  const [input, setInput] = useState<string>('');

  const currentUser: messageUser = {
    userId: myDetails?.userId, name: myDetails?.name,
  };

  useEffect(() => {
    let msgIdForMe = `${myDetails?.userId}_${otherDetails?.userId}`;
    let unsubscribe: (() => void) | undefined;

    const loadMessages = async () => {
      unsubscribe = await fetchMessages(msgIdForMe, null);
    };

    loadMessages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const onSend = () => {
    if (!input.trim()) return;
    const newMessages12 = {
      text: input,
      _id: new Date().getTime(),
      createdAt: new Date().getTime(),
      user: { userId: myDetails?.userId, name: myDetails?.name },
    };
    console.log('newMessages12newMessages12', newMessages12);
    let msgIdForMe = `${myDetails?.userId}_${otherDetails?.userId}`;
    let msgIdForOther = `${otherDetails?.userId}_${myDetails?.userId}`;

    // message send=========
    sendMessage(msgIdForMe, newMessages12);
    sendMessage(msgIdForOther, newMessages12);

    // inbox update=========
    let myInbox = {
      userId: myDetails?.userId,
      name: myDetails?.name,
      lastMessage: newMessages12.text,
      timestamp: newMessages12.createdAt,
    }
    let otherInbox = {
      userId: otherDetails?.userId,
      name: otherDetails?.name,
      lastMessage: newMessages12.text,
      timestamp: newMessages12.createdAt,
    }
    createUserInbox(otherInbox, myDetails?.userId, otherDetails?.userId);
    createUserInbox(myInbox, otherDetails?.userId, myDetails?.userId);

    setInput('');
  }




  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const closeMenu = () => {
    setIsOpenMenu(false);
  };



  const renderItem = ({ item, index }: { item: Message, index: number }) => {
    const isMe = item.user.userId === currentUser.userId;
    return (
      <View style={[styles.messageRow, isMe ? styles.rightAlign : styles.leftAlign]}>
        <View style={[styles.messageBubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <AppText style={[styles.messageText]}>{item.text}</AppText>
        </View>
        <AppText style={styles.timeText}>
          {item.createdAt && new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </AppText>
      </View>
    );
  };

  return (
    <Container>
      {isOpenMenu && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu} />
      )}
     
{/* 
 <ChatHeader
        isOpenMenu={isOpenMenu}
        closeMenu={closeMenu}
        openMenu={() => setIsOpenMenu(true)}
        otherDetails={otherDetails}
      />
*/}
      <>
        <KeyboardAwareFlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.createdAt.toString() + index + item.text}
          inverted
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sendButton} onPress={onSend}>
              <VectoreIcons icon="Ionicons" name="send" size={SF(19)} color={Colors.themeColor} />
            </TouchableOpacity>
          </>
        </View>
      </>
    </Container>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatList: {
    padding: 15,
    paddingBottom: 10,
  },
  messageRow: {
    flexDirection: 'column',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  leftAlign: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  rightAlign: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    padding: 10,
  },
  bubbleLeft: {
    backgroundColor: '#F2F2F2',
  },
  bubbleRight: {
    backgroundColor: '#F2F2F2',
  },
  messageText: {
    fontSize: SF(12),
    fontFamily: Fonts.REGULAR,
    color: Colors.textAppColor,
  },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: SF(0),
    paddingHorizontal: SF(10),
    backgroundColor: '#0000000D',
    width: '85%',
    borderRadius: SF(10),
    alignSelf: 'center',
    marginBottom: 8
  },
  input: {
    flex: 1,
    // backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: Colors.themeColor,
    fontSize: SF(19),
  },



  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SW(20),
    paddingVertical: SH(10),
    borderBottomWidth: 1,
    borderColor: Colors.textAppColor + '20',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SW(25),
    flex: 1,
  },
  avatarWrapper: {
    height: SF(50),
    width: SF(50),
    borderRadius: SF(25),
    overflow: 'hidden',
    borderWidth: 1,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  nameContainer: {
    marginLeft: SW(8),
    flex: 1,
  },
  userName: {
    fontFamily: Fonts.Chivo_Medium,
    fontSize: SF(14),
    color: Colors.textAppColor,
  },
  lastSeen: {
    fontFamily: Fonts.Chivo_Medium,
    fontSize: SF(10),
    color: Colors.lightGraytext,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    zIndex: 99999999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});
