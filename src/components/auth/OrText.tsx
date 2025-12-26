import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { CustomText } from '@components/common'
import { useTranslation } from 'react-i18next';
import { screenWidth, useThemeContext } from '@utils/theme';

const OrText = () => {
    const { t } = useTranslation();
    const theme = useThemeContext();
    const styles = useMemo(() => StyleSheet.create({
        lineViewContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 6,
            marginTop: theme.SF(20)
        },
        leftRightLine: {
            height: 1,
            backgroundColor: theme.colors.white,
            width: screenWidth * 0.39,
        },
        ortext: {
            color: theme.colors.whitetext,
            fontFamily: theme.fonts.BOLD,
            fontSize: theme.SF(14),
            alignSelf: 'flex-end',
            textAlign: 'right',
        },
    }), [])



    return (
        <View style={styles.lineViewContainer}>
            <View style={styles.leftRightLine} />
            <CustomText style={styles.ortext}>{t('login.orText')}</CustomText>
            <View style={styles.leftRightLine} />
        </View>
    )
}

export default OrText
