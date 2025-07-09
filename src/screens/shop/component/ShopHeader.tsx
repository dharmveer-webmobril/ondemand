import { View, StyleSheet, TouchableOpacity, Image, Platform, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, goBack, SF, SH, SW, useIsPortrait } from '../../../utils';
import { InputField, } from '../../../component';
import imagePaths from '../../../assets/images';
import VectorIcon from '../../../component/VectoreIcons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';


interface HeaderProps {
    onclickAdd?: (text: string) => void;
    onclicCalender?: (text: string) => void;
    onclicHeart?: (text: string) => void;
    onclicNotification?: (text: string) => void;
}

const ShopHeader: React.FC<HeaderProps> = ({
    // onclickAdd = () => { },
    // onclicCalender = () => { },
    // onclicHeart = () => { },
    // onclicNotification = () => { },
}) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const isPortrait = useIsPortrait();
    const getHeaderHeight = () => {
        const statusBarHeight = getStatusBarHeight();
        if (Platform.OS === 'android') {
            return isPortrait ? statusBarHeight - 6 : statusBarHeight + 20;
        } else {
            return isPortrait ? insets.top - 6 : insets.top + 20;
        }
    };
    const paddingTop = useMemo(() => {
        let h = getHeaderHeight()
        return h
    }, [isPortrait, insets.top]);

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.container, { paddingTop: Platform.OS == 'android' ? paddingTop : 0 }]}
            colors={[Colors.themeDarkColor, Colors.themeColor]}>
            <View style={styles.innerContainer}>
                <TouchableOpacity
                    onPress={() => { goBack() }}
                    activeOpacity={0.5}
                    style={styles.backIconContainer}>
                    <VectorIcon
                        icon="Entypo"
                        color={Colors.white}
                        name="chevron-thin-left"
                        size={SF(24)}
                    />
                </TouchableOpacity>
                <View style={{ width: '75%', marginRight: SF(11) }}>
                    <InputField
                        placeholder={'Search'}
                        inputContainer={{ backgroundColor: Colors.bgwhite, borderWidth: 0, height: SF(40) }}
                        inputStyle={styles.inputStyle}
                        placeholderTextColor={Colors.searchBarPlac}
                        leftIcon={imagePaths.Search}
                        color={Colors.searchBarPlac}
                    />
                </View>
                <Pressable
                    style={styles.filterButton}
                >
                    <Image
                        source={imagePaths.filter_icon}
                        style={styles.filterIcon}
                    />
                </Pressable>
            </View>
        </LinearGradient>
    );
};
export default ShopHeader;
const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: SF(30),
        paddingBottom: SF(8)
    },
    inputStyle: {
        color: Colors.searchBarPlac,
        fontFamily: Fonts.MEDIUM,
        marginLeft: Platform.OS == 'ios' ? 3 : 0,
        fontSize: SF(16),
    },

    backIconContainer: {
        zIndex: 99,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginRight: SF(12),
        padding: 5,
        marginTop: -6
    },

    filterButton: {
        borderRadius: SF(6),
        justifyContent: 'center',
        alignItems: 'center',
        height: SF(30),
        width: SF(30),
        backgroundColor: Colors.white,
    },
    filterIcon: {
        height: SF(20),
        width: SF(20),
        resizeMode: 'contain',
        tintColor: Colors.themeColor
    },
});
