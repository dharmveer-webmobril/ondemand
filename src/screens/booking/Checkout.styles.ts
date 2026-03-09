import { StyleSheet } from 'react-native';
import { ThemeType } from '@utils/theme';

export const createStyles = (theme: ThemeType) => {
  const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingBottom: SH(90),
    },
    section: {
      paddingHorizontal: SW(20),
      paddingVertical: SH(14),
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray || '#E0E0E0',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SH(8),
    },
    sectionTitle: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(8),
    },
    changeLink: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.primary,
    },
    summaryCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(12),
      gap: SH(6),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    summaryValue: {
      fontSize: SF(12),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    addressCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(12),
    },
    addressTitle: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
      marginBottom: SH(3),
    },
    addressText: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.textAppColor || Colors.text,
      marginBottom: SH(3),
    },
    addressPhone: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    emptyAddressCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(12),
      alignItems: 'center',
      gap: SH(8),
    },
    emptyAddressText: {
      fontSize: SF(12),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
    },
    addAddressButton: {
      borderRadius: SF(8),
      paddingHorizontal: SW(20),
    },
    serviceForCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(12),
    },
    serviceForContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SW(10),
    },
    serviceForText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    inputWrapper: {
      marginBottom: SH(16),
    },
    inputLabel: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(8),
    },
    phoneInputContainer: {
      flexDirection: 'row',
      gap: SW(12),
      marginTop: SH(8),
    },
    countryCodeButton: {
      backgroundColor: Colors.white,
      borderRadius: SF(8),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
    },
    phoneInput: {
      flex: 1,
    },
    addressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SH(8),
    },
    selectAddressButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(16),
      borderWidth: 1,
      borderColor: Colors.gray || '#E0E0E0',
      borderStyle: 'dashed',
    },
    selectAddressText: {
      fontSize: SF(14),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.white,
      paddingHorizontal: SW(20),
      paddingVertical: SH(12),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    confirmButton: {
      borderRadius: SF(12),
    },
    paymentModeRow: {
      gap: SH(12),
      marginBottom: SH(8),
    },
    paymentRadioRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    radioButton: {
      width: SF(20),
      height: SF(20),
      borderRadius: SF(10),
      borderWidth: 2,
      borderColor: Colors.gray || '#999',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SW(12),
    },
    radioButtonSelected: {
      borderColor: Colors.primary,
    },
    radioButtonInner: {
      width: SF(10),
      height: SF(10),
      borderRadius: SF(5),
      backgroundColor: Colors.primary,
    },
    paymentRadioLabel: {
      fontSize: SF(14),
      fontFamily: Fonts.REGULAR,
      color: Colors.text,
      flex: 1,
    },
    walletCard: {
      backgroundColor: Colors.background || '#F5F5F5',
      borderRadius: SF(12),
      padding: SW(14),
      marginTop: SH(10),
      gap: SH(6),
    },
    walletRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    walletRowLast: {
      marginTop: SH(6),
      paddingTop: SH(8),
      borderTopWidth: 1,
      borderTopColor: Colors.gray || '#E0E0E0',
    },
    walletLabel: {
      fontSize: SF(13),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText || Colors.text,
    },
    walletValue: {
      fontSize: SF(13),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
    },
    walletLabelBold: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.text,
    },
    walletValueBold: {
      fontSize: SF(14),
      fontFamily: Fonts.SEMI_BOLD,
      color: Colors.primary,
    },
    walletInputLabel: {
      fontSize: SF(12),
      fontFamily: Fonts.MEDIUM,
      color: Colors.text,
      marginBottom: SH(6),
    },
    walletInputWrap: {
      marginBottom: SH(8),
    },
    walletHint: {
      fontSize: SF(11),
      fontFamily: Fonts.REGULAR,
      color: Colors.lightText,
      marginTop: SH(6),
    },
    walletErrorText: {
      fontSize: SF(13),
      fontFamily: Fonts.MEDIUM,
      color: Colors.errorText || Colors.red || '#DC3545',
      marginTop: SH(8),
    },
  });
};
