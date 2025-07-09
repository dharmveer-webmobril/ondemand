import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  Actions,
  Bubble,
  Composer,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import { ChatContext } from './ChatProvider';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppText, VectoreIcons } from '../component';


const CustomHeader = ({ title }:any) => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <AppText style={styles.backText}>{'<'}</AppText>
      </TouchableOpacity>
      <AppText style={styles.headerTitle}>{title}</AppText>
    </View>
  );
};


export default function ChatScreen() {
  const route = useRoute<any>();
  let { otherDetails, myDetails } = route?.params;
  console.log('myDetails-', myDetails, 'otherDetails-', otherDetails);

  const chatContext = useContext(ChatContext);
  if (!chatContext) return null;
  const { sendMessage, fetchMessages, messages } = chatContext;
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: true, // ✅ Ensure header is shown
        header: () => <CustomHeader title="Chat with John" />, // ✅ Custom Header
      });
    }, [])
  );
  useEffect(() => {
    let msgIdForMe = `${myDetails?.userId}_${otherDetails?.userId}`;
    console.log('msgIdForMe', msgIdForMe);
    fetchMessages(msgIdForMe, null);
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    const newMessages12 = newMessages.map(message => ({
      ...message,
      _id: new Date().getTime(),
      createdAt: new Date().getTime(),
      user: { _id: myDetails?.userId, name: myDetails?.name },
    }));

    let msgIdForMe = `${myDetails?.userId}_${otherDetails?.userId}`;
    let msgIdForOther = `${otherDetails?.userId}_${myDetails?.userId}`;
    sendMessage(msgIdForMe, newMessages12[0]);
    sendMessage(msgIdForOther, newMessages12[0]);
  }, []);

  const renderCustomBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: styles.rightBubble,
        left: styles.leftBubble,
      }}
      textStyle={{
        right: styles.rightBubbleText,
        left: styles.leftBubbleText,
      }}
    />
  );

  const renderActions = (props: any) => (
    <Actions
      {...props}
      icon={() => (
        <VectoreIcons icon="Ionicons" name="camera" size={18} color="#ffffff" />
      )}
      iconTextStyle={{ alignSelf: 'center' }}
      containerStyle={styles.actionsContainer}
      onPressActionButton={() => {
        console.log('Open Image Picker');
      }}
    />
  );
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  return (
    <GiftedChat
      messages={messages}
      renderBubble={renderCustomBubble}
      onSend={messages => {
        onSend(messages);
      }}
      user={{ _id: myDetails?.userId }}
      renderActions={renderActions}
      onLoadEarlier={() => {
        if (messages.length >= 25) {
          const oldestMessageTimestamp =
            messages[messages.length - 1].createdAt; // Get first message's timestamp
          fetchMessages(
            `${myDetails?.userId}_${otherDetails?.userId}`,
            oldestMessageTimestamp,
          );
        }
      }}
      isLoadingEarlier={false}
      infiniteScroll={true}
      loadEarlier={true}
      messagesContainerStyle={{ paddingBottom: 17 }}
      renderSend={props => (
        <Send {...props} containerStyle={styles.sendContainer}>
          <VectoreIcons icon="Ionicons" name="send" size={30} color="#1f2c34" />
        </Send>
      )}
      renderComposer={props => (
        <Composer {...props} textInputStyle={styles.composerText} />
      )}
      renderInputToolbar={props => (
        <InputToolbar
          {...props}
          primaryStyle={{ alignItems: 'center' }}
          containerStyle={styles.inputToolbar}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  rightBubble: {
    backgroundColor: '#D9D9D9',
  },
  leftBubble: {
    backgroundColor: '#0078FF',
  },
  rightBubbleText: {
    color: '#000000',
  },
  leftBubbleText: {
    color: '#fff',
  },
  actionsContainer: {
    backgroundColor: '#696969',
    borderRadius: 12.5,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  inputToolbar: {
    backgroundColor: '#1f2c34',
    borderRadius: 30,
    marginBottom: 5,
    width: '75%',
    marginLeft: '7%',
  },
  sendContainer: {
    width: 50,
    position: 'absolute',
    right: -50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerText: {
    color: '#ffffff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    padding: 10,
  },
  backText: {
    color: '#6200ee',
    fontSize: 25,
  },
  headerTitle: {
    color: '#6200ee',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
