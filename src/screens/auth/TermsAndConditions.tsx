import { AppHeader, Container, CustomText, Spacing } from '@components';
import { useRoute } from '@react-navigation/native';
import { goBack } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetTermsAndConditions } from '@services/api/queries/appQueries';

const TermsAndConditions = () => {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;
    
    // Get the type from route params (e.g., 'Terms and Condition', 'Privacy Policies', 'Return Policies')
    const type = route?.params?.type || 'Terms and Condition';
    
    const { data: termsData, isLoading, error } = useGetTermsAndConditions();
    
    const styles = useMemo(() => createStyles(theme), [theme]);
    
    // Find the specific term based on type
    const selectedTerm = useMemo(() => {
        if (!termsData?.ResponseData) return null;
        return termsData.ResponseData.find((term: any) => term.flag === type);
    }, [termsData, type]);

    return (
        <Container safeArea={false} statusBarColor={theme.colors.white} style={{ backgroundColor: theme.colors.white ,paddingHorizontal:20}}>
            <Spacing space={statusBarHeight} />
            <AppHeader
                title={type}
                onLeftPress={() => goBack()}
                tintColor={theme.colors.text}
                backgroundColor={theme.colors.white}
            />
            
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <CustomText color={theme.colors.text} textAlign="center" fontSize={theme.fontSize.md}>
                        {t('privacyPolicy.error_fetch_failed')}
                    </CustomText>
                </View>
            ) : !selectedTerm ? (
                <View style={styles.errorContainer}>
                    <CustomText color={theme.colors.text} textAlign="center" fontSize={theme.fontSize.md}>
                        {t('privacyPolicy.no_data')}
                    </CustomText>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <CustomText
                            fontSize={theme.fontSize.lg}
                            fontFamily={theme.fonts.SEMI_BOLD}
                            color={theme.colors.text}
                            marginBottom={theme.SH(20)}
                        >
                            {selectedTerm.flag}
                        </CustomText>
                        
                        <CustomText
                            fontSize={theme.fontSize.md}
                            fontFamily={theme.fonts.REGULAR}
                            color={theme.colors.text}
                            lineHeight={theme.SF(24)}
                        >
                            {selectedTerm.content}
                        </CustomText>
                    </View>
                </ScrollView>
            )}
        </Container>
    );
};

export default TermsAndConditions;

const createStyles = (theme: any) => StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: theme.SH(40),
    },
    content: {
        paddingTop: theme.SH(20),
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.SH(100),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.SH(100),
        paddingHorizontal: theme.SW(20),
    },
});

