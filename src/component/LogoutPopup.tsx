import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, navigate, SF, SH, SW } from '../utils';
import AuthBottomContainer from './AuthBottomContainer';
import Buttons from './Button';
import { useDispatch } from 'react-redux';
import { logout } from '../redux';
import RouteName from '../navigation/RouteName';
import AppText from './AppText';

type LogoutPopupProps = {
  modalVisible: boolean;
  closeModal: () => void;
};
const LogoutPopup: React.FC<LogoutPopupProps> = ({
  modalVisible = true,
  closeModal,
}) => {
  const dispatch = useDispatch();
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => closeModal()}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#00000050',
          justifyContent: 'flex-end',
        }}>
        <View style={{ height: '45%' }}>
          <AuthBottomContainer>
            <View style={{ marginTop: SH(30), justifyContent: "space-between", height: '90%' }}>
              <View>
                <AppText style={styles.heading}>Logout</AppText>
                <AppText style={styles.subtitile}>
                  Are you sure you want to logout?
                </AppText>
              </View>
              <View>
                <Buttons
                  buttonStyle={{ backgroundColor: Colors.bgwhite, width: "80%", alignSelf: 'center' }}
                  textColor={Colors.themeColor}
                  title={'Logout'}
                  onPress={() => {
                    dispatch(logout());
                    closeModal()
                    navigate(RouteName.LOGIN)
                  }}
                />
                <Buttons
                  buttonStyle={{ backgroundColor: Colors.themeColor, marginVertical: 20, width: "80%", alignSelf: 'center' }}
                  textColor={Colors.textWhite}
                  title={'Cancel'}
                  onPress={() => {
                    closeModal()
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
