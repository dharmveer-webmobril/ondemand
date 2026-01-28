import { View, StyleSheet, ScrollView } from 'react-native'
import React, { useMemo, useState, useCallback } from 'react'
import Container from '@components/common/Container'
import { AppHeader, CustomText, CustomButton } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ServiceSummeryCard } from '@components';
import SCREEN_NAMES from '@navigation/ScreenNames';

type SelectedOffer = {
    serviceId: string;
    offerId: string;
    offer: any;
    discountAmount: number;
};

export default function BookingSummery() {
    const theme = useThemeContext();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    console.log('route--------route', route.params?.bookingData);
    const { bookingData } = route.params;
    const { date, timeSlot, providerData, selectedServices } = bookingData;
    
    // Track selected offers: { serviceId: { offerId, offer, discountAmount } }
    const [selectedOffers, setSelectedOffers] = useState<Record<string, SelectedOffer>>({});

    // Handle offer change from ServiceSummeryCard
    const handleOfferChange = useCallback((serviceId: string, offerId: string | null, discountAmount: number, offer?: any) => {
        if (!offerId || !offer) {
            // Remove offer
            setSelectedOffers((prev) => {
                const newOffers = { ...prev };
                delete newOffers[serviceId];
                return newOffers;
            });
            return;
        }

        // Add offer
        setSelectedOffers((prev) => ({
            ...prev,
            [serviceId]: {
                serviceId,
                offerId,
                offer,
                discountAmount,
            },
        }));
    }, []);

    // Calculate total price and duration with discounts
    const { totalPrice, totalDuration } = useMemo(() => {
        let price = 0;
        let duration = 0;

        selectedServices.forEach((service: any) => {
            const basePrice = service.price || 0;
            const selectedOffer = selectedOffers[service._id];
            const discountAmount = selectedOffer?.discountAmount || 0;
            const discountedServicePrice = basePrice - discountAmount;
            
            const addOnsPrice = service.selectedAddOns?.reduce((sum: number, addOn: any) => sum + (addOn.price || 0), 0) || 0;
            price += discountedServicePrice + addOnsPrice;

            const baseDuration = service.time || 0;
            const addOnsDuration = service.selectedAddOns?.reduce((sum: number, addOn: any) => sum + (addOn.duration || 0), 0) || 0;
            duration += baseDuration + addOnsDuration;
        });

        return { totalPrice: price, totalDuration: duration };
    }, [selectedServices, selectedOffers]);

    // Handle checkout button press
    const handleCheckout = useCallback(() => {
        // Add applied offer JSON inside each selected service (if any offers are selected)
        const updatedServices = selectedServices.map((service: any) => {
            const selectedOffer = selectedOffers[service._id];
            if (selectedOffer) {
                return {
                    ...service,
                    appliedOffer: selectedOffer.offer, // Add the full offer object
                    selectedOfferId: selectedOffer.offerId,
                    discountAmount: selectedOffer.discountAmount,
                };
            }
            return service;
        });

        // Update booking data with offers and new totals
        const updatedBookingData = {
            ...bookingData,
            selectedServices: updatedServices,
            totalPrice: totalPrice,
            totalDuration: `${totalDuration}m`,
        };

        // Navigate to Checkout screen
        navigation.navigate(SCREEN_NAMES.CHECKOUT, {
            bookingData: updatedBookingData,
        });
    }, [selectedServices, selectedOffers, bookingData, totalPrice, totalDuration, navigation]);

    return (
        <Container safeArea={true} style={styles.container}>
            <AppHeader
                title={t('bookingSummery.title')}
                onLeftPress={() => navigation.goBack()}
                backgroundColor="transparent"
                tintColor={theme.colors.text}
                containerStyle={{ marginHorizontal: theme.SW(20) }}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.section}>
                    {/* Provider and Appointment Summary */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <CustomText style={styles.summaryName}>{providerData?.businessProfile?.name}</CustomText>
                            <CustomText style={styles.summaryAddress}>{providerData?.businessProfile?.address}</CustomText>
                            <CustomText style={styles.summeryDate}>{`${date} ${timeSlot}`}</CustomText>
                        </View>
                    </View>

                </View>
                {/* Service Summary */}
                <ServiceSummeryCard
                    pageName={'booking-summery'}
                    services={selectedServices}
                    onRemoveService={() => { }}
                    onAddAddOns={() => { }}
                    onAddService={() => { }}
                    onOfferChange={handleOfferChange}
                />
            </ScrollView>
            
            {/* Checkout Button and Total - Always visible */}
            <View style={styles.checkoutContainer}>
                <View style={styles.totalContainer}>
                    <CustomText style={styles.totalLabel}>Total</CustomText>
                    <View style={styles.totalDetails}>
                        <CustomText style={styles.totalPrice}>${totalPrice.toFixed(2)}</CustomText>
                        <CustomText style={styles.totalDuration}>• {totalDuration}m</CustomText>
                    </View>
                </View>
                <CustomButton
                    title={t('bookingSummery.checkout')}
                    onPress={handleCheckout}
                    buttonStyle={styles.checkoutButton}
                    backgroundColor={theme.colors.primary}
                    textColor={theme.colors.white}
                />
            </View>
        </Container>
    )
}
const createStyles = (theme: ThemeType) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.white,
        },
        scrollView: {
            flex: 1,
        },
        content: {
            // paddingHorizontal: theme.SW(20),
            paddingVertical: theme.SH(20),
        },
        section: {
            paddingHorizontal: theme.SW(20),
            paddingVertical: theme.SH(20),
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.gray,
        },
        sectionTitle: {
            fontSize: theme.fontSize.md,
            fontFamily: theme.fonts.SEMI_BOLD,
            color: theme.colors.text,
        },
        summaryCard: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            padding: theme.padding.md,
        },
        summaryRow: {
            // flexDirection: 'row',
            justifyContent: 'space-between',
            // alignItems: 'center',
        },
        summaryName: {
            fontSize: theme.SF(16),
            fontFamily: theme.fonts.MEDIUM,
            color: theme.colors.text,
        },
        summaryAddress: {
            fontSize: theme.SF(12),
            fontFamily: theme.fonts.REGULAR,
            color: theme.colors.text,
            marginTop: theme.SH(3),
        },
        summeryDate: {
            fontSize: theme.SF(12),
            fontFamily: theme.fonts.REGULAR,
            color: theme.colors.text,
            marginTop: theme.SH(3),
        },
        serviceCard: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            padding: theme.padding.md,
        },
        serviceRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        serviceName: {
            fontSize: theme.SF(14),
            fontFamily: theme.fonts.MEDIUM,
            color: theme.colors.text,
        },
        checkoutContainer: {
            paddingHorizontal: theme.SW(20),
            paddingVertical: theme.SH(16),
            backgroundColor: theme.colors.white,
            borderTopWidth: 1,
            borderTopColor: theme.colors.gray,
            gap: theme.SH(12),
        },
        totalContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalLabel: {
            fontSize: theme.SF(16),
            fontFamily: theme.fonts.SEMI_BOLD,
            color: theme.colors.text,
        },
        totalDetails: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.SW(8),
        },
        totalPrice: {
            fontSize: theme.SF(18),
            fontFamily: theme.fonts.BOLD,
            color: theme.colors.primary,
        },
        totalDuration: {
            fontSize: theme.SF(14),
            fontFamily: theme.fonts.REGULAR,
            color: theme.colors.text,
        },
        checkoutButton: {
            width: '100%',
        },
    });
};