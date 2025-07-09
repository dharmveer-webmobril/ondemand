import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AppHeader,
  Container,
  RatingReviewItems,
} from '../../component';
import {Colors, Fonts, SF, SH, SW} from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

type RatingRiviewProps = {};
const RatingRiview: React.FC<RatingRiviewProps> = ({}) => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();

  const paymentData = [
    { name: 'House Cleaning', datetime: '10-Feb-25', price: '$29', status: 'Completed', id: 1 },
    { name: 'House Cleaning', datetime: '10-Feb-25', price: '$290', status: 'Pending', id: 2 },
    { name: 'House Cleaning', datetime: '10-Feb-25', price: '$290', status: 'Pending', id: 3 },
    { name: 'House Cleaning', datetime: '10-Feb-25', price: '$290', status: 'Pending', id: 4 },
    { name: 'House Cleaning', datetime: '10-Feb-25', price: '$290', status: 'Pending', id: 5 },
    { name: 'House Cleaning', datetime: '10-Feb-25', price: '$290', status: 'Pending', id: 6 },
  ];

  return (
    <Container isPadding={true}>
      <AppHeader
        headerTitle={t('profile.ratingsReviews')}
        onPress={() => navigation.goBack()}
        Iconname="arrowleft"
        rightOnPress={() => {}}
        headerStyle={styles.header}
      />
 
        <View style={styles.container}>
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            data={paymentData}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => <RatingReviewItems item={item} />}
            keyExtractor={(item, index) => item.name + index}
            removeClippedSubviews={false}
          />
        </View>
  
    </Container>
  );
};

export default RatingRiview;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(25),
  },
  container: {
    paddingHorizontal: SW(25),
    paddingTop: SH(20),
  },
  totalSpentContainer: {
    backgroundColor: Colors.themelight,
    flexDirection: 'row',
    padding: SW(12),
    justifyContent: 'space-between',
    marginBottom: SH(30),
    borderRadius: SW(10),
  },
  totalSpentText: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(16),
    color: Colors.textAppColor,
  },
  totalSpentAmount: {
    color: Colors.themeColor,
    fontFamily: Fonts.BOLD,
    fontSize: SF(16),
  },
  transactionHistoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SW(12),
    justifyContent: 'space-between',
    marginBottom: SH(25),
    borderRadius: SW(10),
  },
  transactionHistoryText: {
    color: Colors.textAppColor,
    fontFamily: Fonts.BOLD,
    fontSize: SF(16),
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    width: SW(35),
    height: SW(35),
  },
  separator: {
    height: SH(15),
  },
  flatListContent: {
    paddingBottom: SH(90),
  },
});
