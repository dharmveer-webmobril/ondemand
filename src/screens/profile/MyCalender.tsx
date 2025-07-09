import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import {
  AppHeader,
  Container,
  MyCalenderItems,
  Spacing,
} from '../../component';
import { calenderData, Colors, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';


type MyCalenderProps = {};
const spaceContainer = () => <Spacing space={SH(15)} />;
const MyCalender: React.FC<MyCalenderProps> = ({ }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  
  return (
    <Container isAuth={false}>
      <AppHeader
        headerTitle={t('profile.myCalendar')}
        onPress={() => {
          navigation.goBack();
        }}
        Iconname="arrowleft"
        rightOnPress={() => { }}
        headerStyle={styles.header}
      />

      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SH(90) }}
          data={calenderData}
          ItemSeparatorComponent={spaceContainer}
          renderItem={({ item }) => <MyCalenderItems item={item} />}
          keyExtractor={(item, index) => item.name + index}
          removeClippedSubviews={false}
        />
      </View>
    </Container>
  );
};

export default MyCalender;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(25),
  },
  separator: {
    height: SH(15),
  },
  container: {
    paddingHorizontal: SW(25),
    paddingTop: SH(20),
    // paddingBottom:SH(89)
  },
});
