import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader, AppText, Container, ProfileList, Spacing } from '../../component';
import { Colors, Fonts, imagePaths, SF, SH, SW } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

type CustomerSupportProps = {};
const CustomerSupport: React.FC<CustomerSupportProps> = ({ }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const renderToggleSetting = (
    type: string,
    label: string,
    value: boolean,
    onToggle: (val: boolean, type: string) => void,
  ) => {
    return (
      <View style={styles.toggleContainer}>
        <AppText style={styles.toggleLabel}>{label}</AppText>
        <TouchableOpacity onPress={() => onToggle(!value, type)}>
          <Image source={value ? imagePaths.switch_on : imagePaths.switch_off} style={{ width: SF(50), height: SF(28), resizeMode: 'contain' }} />
        </TouchableOpacity>
      </View>
    );
  };

  let helpCenter = { name:t('customerSupport.helpCenter'), id: 10, onClick: () => { } };
  let contactSupport = { name: t('customerSupport.contactSupport'), id: 10, onClick: () => { } };
  let assistance = { name: t('customerSupport.assistance'), id: 10, onClick: () => { } };
  let issueTracking = { name: t('customerSupport.issueTracking'), id: 10, onClick: () => { } };

  const [supportToggle, setSupportToggle] = useState({
    booking: true,
    service: true,
    promotion: true,
  })
  const btnSwitchToglle = (value: boolean, type: string) => {
    if (type == 'booking') setSupportToggle(prev => { return { ...prev, booking: value } })
    if (type == 'service') setSupportToggle(prev => { return { ...prev, service: value } })
    if (type == 'promotion') setSupportToggle(prev => { return { ...prev, promotion: value } })
  }
  return (
    <Container isPadding={true}>
      <AppHeader
        headerTitle={t('profile.customerSupport')}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.pop();
          }
        }}
        Iconname="arrowleft"
        rightOnPress={() => { }}
        headerStyle={styles.header}
      />
      <View style={styles.container}>
        
        <AppText style={styles.sectionTitle}>{t('customerSupport.supportSection')}</AppText>
        <ProfileList item={helpCenter} />
        <Spacing space={SH(18)} />
        <ProfileList item={contactSupport} />
        <Spacing space={SH(20)} />
        <AppText style={styles.sectionTitle}>{t('customerSupport.liveChatSupportracking')}</AppText>
        <ProfileList item={assistance} />
        <Spacing space={SH(20)} />
        <AppText style={styles.sectionTitle}>{t('customerSupport.ticketSystem')}</AppText>
        <ProfileList item={issueTracking} />
      </View>
    </Container>
  );
};

export default CustomerSupport;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.bgwhite,
    paddingHorizontal: SW(25),
  },
  container: {
    paddingHorizontal: SW(25),
    paddingTop: SH(40),
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SH(20),

  },
  toggleLabel: {
    fontFamily: Platform.OS === 'android' ? Fonts.MEDIUM : Fonts.REGULAR,
    fontSize: SF(14),
  },
  sectionTitle: {
    color: Colors.textAppColor,
    fontFamily: Fonts.SEMI_BOLD,
    fontSize: SF(16),
    marginBottom: SH(15),
    marginTop: SH(5),
  },
  toggleWrapper: {
    paddingHorizontal: SW(10),
  },
});
