import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Fonts, imagePaths, SF, SW } from '../../utils';
import { AppText, Divider, VectoreIcons } from '../../component';
import { useTranslation } from 'react-i18next';

interface AddressMenuProps {
  onSelect: (value: 'edit' | 'delete' | 'feedback') => void;
  isBlocked: boolean;
}

const AddressMenu: React.FC<AddressMenuProps> = ({ onSelect }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Menu onSelect={onSelect}>
        <MenuTrigger>
          <VectoreIcons
            icon='MaterialCommunityIcons'
            name="dots-vertical"
            size={24}
            color="#00788D"
          />
        </MenuTrigger>
        <MenuOptions customStyles={menuStyles}>
          <MenuOption value="edit">
            <View style={styles.menuItem}>
              <Image source={imagePaths.fe_edit} style={styles.menuIcon} />
              <AppText style={styles.menuText}>{t('myAddress.menuEdit', { defaultValue: 'Edit' })}</AppText>
            </View>
            <Divider color="#DEDEDE" />
          </MenuOption>
          <MenuOption value="delete">
            <View style={styles.menuItem}>
              <Image source={imagePaths.delete_icon} style={styles.menuIcon} />
              <AppText style={styles.menuText}>{t('myAddress.menuDelete', { defaultValue: 'Delete' })}</AppText>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
};

export default AddressMenu;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: SF(12),
    marginLeft: SF(8),
    color: '#000',
    fontFamily: Fonts.Chivo_Medium,
    zIndex: 999999999,
  },
  menuIcon: {
    height: SF(12),
    width: SF(12),
    zIndex: 999999999,
  },
});

const menuStyles = {
  optionsContainer: {
    borderRadius: SF(6),
    paddingVertical: 2,
    width: SW(120),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    marginTop: 30,
  },
};