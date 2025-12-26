import { View, StyleSheet, Modal, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomButton, CustomText } from '@components/common';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export default function LogoutModal({ visible, onClose, onLogout }: LogoutModalProps) {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t } = useTranslation();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[styles.content]}
                        colors={theme.colors.gradientColor}
                    >
                        <CustomText style={styles.title}>{t('logoutPopup.heading')}</CustomText>
                        <CustomText style={styles.subtitle}>{t('logoutPopup.subtitle')}</CustomText>
                        <View style={styles.buttonsContainer}>
                            <CustomButton
                                buttonStyle={styles.logoutButton}
                                buttonTextStyle={styles.logoutButtonText}
                                backgroundColor={theme.colors.white}
                                textColor={theme.colors.primary}
                                onPress={onLogout}
                                title={t('logoutPopup.logoutButton')}
                            />
                           
                            <CustomButton
                                buttonTextStyle={styles.cancelButtonText}
                                onPress={onClose}
                                title={t('logoutPopup.cancelButton')}
                            />
                        </View>
                    </LinearGradient>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: '100%',
    },
    content: {
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        paddingTop: theme.SH(30),
        paddingBottom: theme.SH(20),
        paddingHorizontal: theme.SW(20),
    },
    title: {
        fontSize: theme.fontSize.xxl,
        color: theme.colors.white,
        fontFamily: theme.fonts.BOLD,
        marginBottom: theme.SH(15),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.white,
        fontFamily: theme.fonts.MEDIUM,
        marginBottom: theme.SH(30),
        textAlign: 'center',
    },
    buttonsContainer: {
        gap: theme.SH(12),
    },
    logoutButton: {
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
    },
    logoutButtonText: {
        fontSize: theme.fontSize.md,
        fontFamily: theme.fonts.BOLD,
    },
    // cancelButton: {
    //     borderRadius: theme.borderRadius.md,
    //     borderColor: theme.colors.white,
    // },
    cancelButtonText: {
        fontSize: theme.fontSize.md,
        fontFamily: theme.fonts.BOLD,
    },
});

