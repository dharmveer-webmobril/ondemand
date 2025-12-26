import { AppHeader, CustomButton, CustomText, InterestItem, Spacing, showToast } from '@components';
import { goBack, navigate } from '@utils/NavigationUtils';
import { useThemeContext } from '@utils/theme';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubmitInterests } from '@services/api/queries/authQueries';
import { useGetCategories } from '@services/api/queries/appQueries';
import { SCREEN_NAMES } from '@navigation';
const IntrestChoose = () => {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const submitInterestsMutation = useSubmitInterests();
    const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetCategories();

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const styles = useMemo(() => createStyles(theme), [theme]);
    const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;

    // Get categories from API response
    const categories = useMemo(() => {
        return categoriesData?.ResponseData || [];
    }, [categoriesData]);

    const handleSubmit = async () => {
        if (selectedIds.size === 0) {
            showToast({
                type: 'error',
                title: t('messages.error'),
                message: t('interestChoose.selectAtLeastOne'),
            });
            return;
        }

        try {
            const interests = Array.from(selectedIds);
            const response = await submitInterestsMutation.mutateAsync({ interests });

            if (response.succeeded && response.ResponseCode === 200) {
                showToast({
                    type: 'success',
                    title: t('messages.success'),
                    message: t('interestChoose.interestsSubmitted'),
                });

                // Navigate to home after successful submission
                setTimeout(() => {
                    navigate(SCREEN_NAMES.HOME);
                }, 1000);
            } else {
                showToast({
                    type: 'error',
                    title: t('messages.error'),
                    message: response.ResponseMessage || t('interestChoose.submissionFailed'),
                });
            }
        } catch (error: any) {
            console.error('Submit interests error:', error);
            showToast({
                type: 'error',
                title: t('messages.error'),
                message: error?.response?.data?.ResponseMessage || t('interestChoose.submissionFailed'),
            });
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                colors={theme.colors.gradientColor}
                style={styles.gradient}
            >
                {/* Actual Screen Content */}
                <View style={styles.content}>
                    <View style={styles.innerContent}>

                        <Spacing space={statusBarHeight} />

                        <AppHeader
                            title={t('interestChoose.title')}
                            onLeftPress={() => goBack()}
                            tintColor="#ffffff"
                        />

                        <CustomText
                            numberOfLines={1}
                            color={theme.colors.whitetext}
                            textAlign="center"
                            marginTop={-12}
                            fontSize={theme.fontSize.sm}
                            fontFamily={theme.fonts.MEDIUM}
                        >
                            {t('interestChoose.subtitle')}
                        </CustomText>

                        {categoriesLoading ? (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="large" color={theme.colors.white} />
                            </View>
                        ) : categoriesError ? (
                            <View style={styles.errorContainer}>
                                <CustomText color={theme.colors.whitetext} textAlign="center">
                                    {t('interestChoose.loadError')}
                                </CustomText>
                            </View>
                        ) : categories.length === 0 ? (
                            <View style={styles.errorContainer}>
                                <CustomText color={theme.colors.whitetext} textAlign="center">
                                    {t('interestChoose.noCategories')}
                                </CustomText>
                            </View>
                        ) : (
                            <FlatList
                                data={categories}
                                renderItem={({ item }) => {
                                    const isSelected = selectedIds.has(item._id);
                                    return (
                                        <InterestItem
                                            name={item.name}
                                            image={item.image}
                                            isSelected={isSelected}
                                            onPress={() => toggleSelect(item._id)}
                                        />
                                    );
                                }}
                                keyExtractor={(item) => item._id}
                                numColumns={2}
                                columnWrapperStyle={styles.columnWrapper}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>

                    {/* Bottom Fixed Button */}
                    <CustomButton
                        title={`${t('interestChoose.continue')} (${selectedIds.size})`}
                        onPress={handleSubmit}
                        backgroundColor={theme.colors.primary}
                        textColor={theme.colors.whitetext}
                        buttonStyle={styles.bottomButton}
                        isLoading={submitInterestsMutation.isPending}
                        disable={submitInterestsMutation.isPending || selectedIds.size === 0}
                    />
                </View>
            </LinearGradient>
        </View>
    );
}

export default IntrestChoose;

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingBottom: 40,
    },
    innerContent: {
        flex: 1,
        paddingHorizontal: theme.SW(25),
    },
    listContent: {
        paddingTop: theme.SF(12),
        paddingBottom: theme.SF(120),   // Increased bottom padding
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    gradientContainer: {
        flex: 1,
        borderRadius: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        paddingHorizontal: theme.SW(20),
    },
    bottomButtonWrapper: {
        marginBottom: theme.SH(10),
    },
    bottomButton: {
        opacity: 1,
        width: '88%',
        alignSelf: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
});