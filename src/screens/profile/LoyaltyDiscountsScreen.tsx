import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView
} from 'react-native';
import { Colors, Fonts, imagePaths, SF, SH, SW } from '../../utils';
import {
  AppHeader,
  AppText,
  Buttons,
  Container,
  Divider,
  Spacing
} from '../../component';
import { useNavigation } from '@react-navigation/native';

const transactions = [
  { id: 1, title: 'Ipsum component variant', points: '+20' },
  { id: 2, title: 'Ipsum component variant', points: '+08' },
  { id: 3, title: 'Ipsum component variant', points: '-20' },
  { id: 4, title: 'Ipsum component variant', points: '+05' },
  { id: 5, title: 'Ipsum component variant', points: '+10' },
];

const CoinSummary = () => (
  <>
    <View style={styles.coinContainer}>
      <View style={styles.coinRow}>
        <Image source={imagePaths.coin} style={styles.coinIcon} />
        <AppText style={styles.coinText}>120</AppText>
      </View>
      <AppText style={styles.coinLabel}>Available Coins</AppText>
    </View>
    <TouchableOpacity style={styles.useButton}>
      <AppText style={styles.useButtonText}>Use Ssnap Coins</AppText>
    </TouchableOpacity>
  </>
);

const TransactionItem = ({ title, points }: { title: string; points: string }) => (
  <View style={styles.transactionItem}>
    <View>
      <AppText style={styles.transactionTitle}>{title}</AppText>
      <AppText style={styles.transactionSubtitle}>Lorem ipsum sitametconsectetur.</AppText>
    </View>
    <AppText style={styles.transactionPoints}>{points}</AppText>
  </View>
);

const ReferSection = () => (
  <View style={styles.referContainer}>
    <AppText style={styles.referTitle}>Refer to earn Ssnap points</AppText>
    <View style={styles.referCard}>
      <Image source={imagePaths.coupan} style={styles.referImage} />
      <View style={styles.codeRow}>
        <AppText style={styles.codeText}>ASDFGHJ</AppText>
        <TouchableOpacity style={styles.copyButton}>
          <Image source={imagePaths.copy_icon} style={styles.copyIcon} />
        </TouchableOpacity>
      </View>
      <AppText style={styles.referDesc}>
        Figma ipsum component variant main layer. Effect undo text distribute boolean edit create.
        Reesizing device invite list pixel arrange move clip clip. Asset polygon layer select bold.
      </AppText>
    </View>
    <Spacing space={SH(20)} />
    <Buttons title="Invite Now" />
  </View>
);

const seperatorComponent = () => <Divider color={`${Colors.textAppColor}10`} />;

const LoyaltyScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <Container>
      <AppHeader
        headerTitle="Loyalty & Discounts"
        onPress={() => navigation.canGoBack() && navigation.pop()}
        Iconname="arrowleft"
        rightOnPress={() => {}}
        headerStyle={styles.appHeader}
      />
      <ScrollView style={styles.container}>
        <CoinSummary />
        <View style={styles.contentPadding}>
          <Spacing space={SH(15)} />
          <FlatList
            data={transactions}
            renderItem={({ item }) => (
              <TransactionItem key={item.id} title={item.title} points={item.points} />
            )}
            ItemSeparatorComponent={seperatorComponent}
            keyExtractor={(item, index) => item.id.toString() + index}
          />
          <ReferSection />
        </View>
      </ScrollView>
    </Container>
  );
};

export default LoyaltyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appHeader: {
    paddingHorizontal: SF(30),
    marginBottom: SH(10),
  },
  contentPadding: {
    paddingHorizontal: SF(30),
  },
  coinContainer: {
    backgroundColor: '#e5f2f8',
    alignItems: 'center',
    paddingVertical: SH(20),
    borderRadius: 10,
    marginBottom: SH(10),
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SF(6),
  },
  coinIcon: {
    width: SF(28),
    height: SF(28),
    marginRight: SF(2.5),
  },
  coinText: {
    fontSize: SF(20),
    fontFamily: Fonts.BOLD,
    color: Colors.textAppColor,
    marginLeft: SF(2.5),
  },
  coinLabel: {
    fontSize: SF(14),
    fontFamily: Fonts.REGULAR,
    color: Colors.textAppColor,
    marginTop: SH(5),
  },
  useButton: {
    width: SF(118),
    height: SF(28),
    marginTop: SH(10),
    backgroundColor: Colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    alignSelf: 'center',
  },
  useButtonText: {
    color: '#fff',
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SH(14),
    paddingHorizontal: SW(7),
  },
  transactionTitle: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(14),
    color: Colors.textAppColor,
  },
  transactionSubtitle: {
    fontFamily: Fonts.REGULAR,
    fontSize: SF(12),
    color: Colors.textAppColor,
    marginTop: SH(4),
  },
  transactionPoints: {
    fontFamily: Fonts.MEDIUM,
    fontSize: SF(12),
    color: Colors.textAppColor,
    marginTop: SH(4),
  },
  referContainer: {
    marginTop: SH(20),
  },
  referTitle: {
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(14),
    color: Colors.textAppColor,
    marginBottom: SH(15),
  },
  referCard: {
    backgroundColor: Colors.themelight,
    padding: SF(20),
    borderRadius: 10,
    alignItems: 'center',
  },
  referImage: {
    width: SF(115),
    height: SF(84),
    resizeMode: 'contain',
    marginBottom: SH(10),
  },
  codeRow: {
    flexDirection: 'row',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SH(10),
    borderWidth: 1,
    borderColor: Colors.themeColor,
    height: SF(35),
    paddingLeft: SW(10),
    overflow: 'hidden',
  },
  codeText: {
    fontSize: SF(14),
    fontFamily: Fonts.MEDIUM,
    marginRight: SW(10),
    color: Colors.themeColor,
  },
  copyButton: {
    height: '100%',
    backgroundColor: Colors.themeColor,
    width: SF(35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIcon: {
    width: SF(20),
    height: SF(20),
    tintColor: Colors.white,
    resizeMode: 'contain',
  },
  referDesc: {
    fontSize: SF(10),
    textAlign: 'center',
    color: Colors.themeColor,
    fontFamily: Fonts.REGULAR,
    marginTop: SH(10),
  },
});
