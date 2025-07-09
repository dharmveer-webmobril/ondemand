import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useCallback, useContext, useEffect } from 'react';
import { ChatContext } from './ChatProvider';
import { AppText, Container } from '../component';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { get, getDatabase, ref } from '@react-native-firebase/database';
import { useSelector } from 'react-redux';
import { RootState } from '../redux';
import { ChatUser } from '../utils';

export default function AllUsersList() {
  const chatContext = useContext(ChatContext);
  if (!chatContext) return null;
  const { fetchAllUsers, allUsers, userData, createUserInbox } = chatContext;
  const navigation = useNavigation<any>();
 
  useFocusEffect(
    useCallback(() => {
      fetchAllUsers()
    }, [])
  );

  function goToChat(item: ChatUser) {
    let myJson = {
      msgCount: 0,
      otherUseId: item?.userId,
      name: item.name,
      lastMessage: '',
    };
    let otherJson = {
      msgCount: 0,
      otherUseId: userData?.userId,
      name: userData?.name,
      lastMessage: '',
    };

    createUserInbox(myJson, userData?.userId, item.userId); //updating self inbox-> js,slefId ,otherUserID
    createUserInbox(otherJson, item.userId, userData?.userId); //updating other inbox> js,otherUserID,slefId
    navigation.navigate('ChatScreen', {
      otherDetails: item,
      myDetails: userData,
    });
  }

  return (
    <Container>
      <View style={{ padding: 25 }}>
        {allUsers && allUsers.length > 0 && (
          <FlatList
            data={allUsers}
            removeClippedSubviews={false}
            renderItem={({ item }) => {
              if (userData?.userId === item?.userId) return null;
              return (
                <TouchableOpacity
                  onPress={() => {
                    goToChat(item);
                  }}
                  style={{
                    paddingHorizontal: 5,
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                  }}>
                  <AppText>{item.email}</AppText>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Container>
  );
}
