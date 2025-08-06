import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Colors, Fonts, SF, SH } from '../utils';
import AuthBottomContainer from './AuthBottomContainer';
import Buttons from './Button';
import { useDispatch } from 'react-redux';
import { api, logout } from '../redux';
import {  resetNavigation } from '../utils/NavigationService';
import RouteName from '../navigation/RouteName';
import AppText from './AppText';
import { useTranslation } from 'react-i18next';

type LogoutPopupProps = {
  modalVisible: boolean;
  closeModal: () => void;
};
const LogoutPopup: React.FC<LogoutPopupProps> = ({
  modalVisible = true,
  closeModal,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const handleLogout = () => {
    dispatch(logout());
    dispatch(api.util.resetApiState()); // Reset API state
    closeModal();
    // Reset navigation stack to ensure previous screens are unmounted
    resetNavigation(RouteName.LOGIN); // Use resetNavigation instead of navigate
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => closeModal()}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <AuthBottomContainer>
            <View style={styles.contentContainer}>
              <View>
                <AppText style={styles.heading}>{t('logoutPopup.heading')}</AppText>
                <AppText style={styles.subtitile}>
                  {t('logoutPopup.subtitle')}
                </AppText>
              </View>
              <View>
                <Buttons
                  buttonStyle={styles.logoutButton}
                  textColor={Colors.themeColor}
                  title={t('logoutPopup.logoutButton')}
                  onPress={() => {
                    handleLogout();
                  }}
                />
                <Buttons
                  buttonStyle={styles.cancelButton}
                  textColor={Colors.textWhite}
                  title={t('logoutPopup.cancelButton')}
                  onPress={() => {
                    closeModal();
                  }}
                />
              </View>
            </View>
          </AuthBottomContainer>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutPopup;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '45%',
  },
  contentContainer: {
    marginTop: SH(30),
    justifyContent: 'space-between',
    height: '90%',
  },
  logoutButton: {
    backgroundColor: Colors.bgwhite,
    width: '80%',
    alignSelf: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.themeColor,
    marginVertical: 20,
    width: '80%',
    alignSelf: 'center',
  },
  subtitile: {
    color: Colors.textWhite,
    fontFamily: Fonts.REGULAR,
    fontSize: SF(14),
    textAlign: 'center',
    margin: SH(20),
    marginBottom: SH(30),
    lineHeight: SH(22),
  },
  heading: {
    color: Colors.textWhite,
    fontFamily: Fonts.BOLD,
    fontSize: SF(20),
    textAlign: 'center',
  },
});