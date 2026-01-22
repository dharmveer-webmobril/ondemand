import { View, StyleSheet, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { ThemeType, useThemeContext } from '@utils/theme';
import { CustomText, ImageLoader, Checkbox, VectoreIcons, CustomButton } from '@components/common';
import imagePaths from '@assets';

type Service = {
    _id: string;
    name: string;
    price: number;
    time: number;
    serviceAddOns?: any[];
    selectedAddOns?: any[];
    images?: string[];
    activeOffers?: any[];
    selectedOfferId?: string; // Track selected offer per service
    appliedOffer?: any; // Applied offer object (used in checkout)
    discountAmount?: number; // Discount amount (used in checkout)
    assignedMember?: {
        id: string;
        name: string;
        avatar?: string;
        phone?: string;
    };
};

type ServiceSummeryCardProps = {
    services: Service[];
    onRemoveService?: (serviceId: string) => void;
    onAddAddOns?: (service: Service) => void;
    onAddService?: () => void;
    onOfferChange?: (serviceId: string, offerId: string | null, discountAmount: number, offer?: any) => void;
    onAssignMember?: (service: Service) => void;
    onCallMember?: (phone: string) => void;
    pageName?: string;
};

export default function ServiceSummeryCard({
    services,
    onRemoveService: _onRemoveService,
    onAddAddOns,
    onAddService: _onAddService,
    onOfferChange,
    onAssignMember,
    onCallMember,
    pageName = ''
}: ServiceSummeryCardProps) {
    const theme = useThemeContext();
    const styles = useMemo(() => createStyles(theme), [theme]);

    // Track selected offers per service: { serviceId: offerId }
    const [selectedOffers, setSelectedOffers] = useState<Record<string, string>>({});

    // Calculate discount amount for a service based on selected offer
    const calculateDiscountAmount = (service: Service, offerId: string | null) => {
        if (!offerId || !service.activeOffers) return 0;
        const offer = service.activeOffers.find((o: any) => o._id === offerId);
        if (!offer || !offer.discountValue) return 0;

        // Apply discount only to service price, not addons
        const servicePrice = service.price || 0;
        return (servicePrice * offer.discountValue) / 100;
    };

    // Calculate service total with discount applied only to service price
    const calculateServiceTotal = (service: Service) => {
        const basePrice = service.price || 0;
        const selectedOfferId = selectedOffers[service._id] || service.selectedOfferId;
        const discountAmount = calculateDiscountAmount(service, selectedOfferId || null);
        const discountedServicePrice = basePrice - discountAmount;
        const addOnsPrice = service.selectedAddOns?.reduce((sum: number, addOn: any) => sum + (addOn.price || 0), 0) || 0;
        return discountedServicePrice + addOnsPrice;
    };

    const calculateServiceDuration = (service: Service) => {
        const baseDuration = service.time || 0;
        const addOnsDuration = service.selectedAddOns?.reduce((sum: number, addOn: any) => sum + (addOn.duration || 0), 0) || 0;
        return baseDuration + addOnsDuration;
    };

    return (
        <View style={styles.section}>
            {pageName !== 'booking-detail' && <CustomText style={styles.sectionTitle}>Selected  Services</CustomText>}
            {services.map((service) => {
                const serviceTotalPrice = calculateServiceTotal(service);
                const serviceTotalDuration = calculateServiceDuration(service);
                const serviceImage = service?.images?.[0] ? { uri: service?.images?.[0] } : imagePaths.no_image;
                return (
                    <View key={service._id} style={styles.serviceCard}>
                        <View style={styles.serviceInfo}>
                            <View style={styles.serviceImageContainer}>
                                <ImageLoader
                                    source={serviceImage}
                                    mainImageStyle={styles.serviceImage}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.serviceDetails}>
                                <CustomText style={styles.serviceName}>{service?.name}</CustomText>
                                <View style={styles.priceRow}>
                                    {selectedOffers[service._id] || service.selectedOfferId ? (
                                        <View>
                                            <CustomText style={styles.originalPrice}>
                                                ${(service.price || 0).toFixed(2)}
                                            </CustomText>
                                            <CustomText style={styles.servicePrice}>
                                                ${serviceTotalPrice.toFixed(2)} • {serviceTotalDuration}m
                                            </CustomText>
                                        </View>
                                    ) : (
                                        <CustomText style={styles.servicePrice}>
                                            ${serviceTotalPrice.toFixed(2)} • {serviceTotalDuration}m
                                        </CustomText>
                                    )}
                                </View>
                            </View>
                        </View>
                        {service.selectedAddOns && service.selectedAddOns.length > 0 && <View style={styles.divider} />}
                        {/* Selected Add-ons */}
                        {service.selectedAddOns && service.selectedAddOns.length > 0 && (
                            <View style={styles.addOnsContainer}>
                                {service.selectedAddOns.map((addOn: any) => (
                                    <View key={addOn._id} style={styles.addOnTag}>
                                        <CustomText style={styles.addOnTagText}>
                                            {addOn.name} (+${addOn.price?.toFixed(2)})
                                        </CustomText>
                                    </View>
                                ))}
                            </View>
                        )}
                        {/* Active Offers with Checkboxes - Only in booking-summery page */}
                        {service?.activeOffers && pageName === 'booking-summery' && service?.activeOffers.length > 0 && (
                            <View style={styles.offersContainer}>
                                {service.activeOffers.map((offer: any) => {
                                    const isSelected = (selectedOffers[service._id] || service.selectedOfferId) === offer._id;
                                    const discountAmount = calculateDiscountAmount(service, offer._id);
                                    const servicePrice = service.price || 0;
                                    const discountedPrice = servicePrice - discountAmount;

                                    const handleOfferToggle = () => {
                                        const newSelectedOffers = { ...selectedOffers };
                                        // If already selected, deselect it; otherwise, select it (only one per service)
                                        if (isSelected) {
                                            delete newSelectedOffers[service._id];
                                            setSelectedOffers(newSelectedOffers);
                                            onOfferChange?.(service._id, null, 0, undefined);
                                        } else {
                                            newSelectedOffers[service._id] = offer._id;
                                            setSelectedOffers(newSelectedOffers);
                                            onOfferChange?.(service._id, offer._id, discountAmount, offer);
                                        }
                                    };

                                    return (
                                        <Pressable
                                            key={offer._id}
                                            onPress={handleOfferToggle}
                                            style={styles.offerItem}
                                        >
                                            <View style={styles.offerContent}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={handleOfferToggle}
                                                    size={theme.SF(16)}
                                                />
                                                <View style={styles.offerInfo}>
                                                    <CustomText style={styles.offerTitle}>
                                                        {offer.title} ({offer.discountValue}% Off)
                                                    </CustomText>
                                                    {isSelected && (
                                                        <CustomText style={styles.discountAmount}>
                                                            Save ${discountAmount.toFixed(2)} • Price: ${discountedPrice.toFixed(2)}
                                                        </CustomText>
                                                    )}
                                                </View>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                        {/* Applied Offer - Display in checkout page */}
                        {service?.appliedOffer && pageName === 'checkout' && (
                            <View style={styles.appliedOfferContainer}>
                                <View style={styles.appliedOfferContent}>
                                    <VectoreIcons
                                        name="checkmark-circle"
                                        icon="Ionicons"
                                        size={theme.SF(18)}
                                        color="#34eb37"
                                    />
                                    <View style={styles.appliedOfferInfo}>
                                        <CustomText style={styles.appliedOfferTitle}>
                                            {service.appliedOffer.title} ({service.appliedOffer.discountValue}% Off) - Applied
                                        </CustomText>
                                        {service.discountAmount && (
                                            <CustomText style={styles.appliedDiscountAmount}>
                                                You saved ${service.discountAmount.toFixed(2)}
                                            </CustomText>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Member Assignment Section - Only in booking-detail page */}
                        {pageName === 'booking-detail' && (
                            <View style={styles.memberSection}>
                                {service.assignedMember ? (
                                    <>
                                        <View style={styles.memberInfo}>
                                            <View style={styles.avatarContainer}>
                                                {service.assignedMember.avatar ? (
                                                    <ImageLoader
                                                        source={{ uri: service.assignedMember.avatar }}
                                                        mainImageStyle={styles.avatar}
                                                        resizeMode="cover"
                                                        fallbackImage={imagePaths.no_image}
                                                    />
                                                ) : (
                                                    <View style={styles.avatarPlaceholder}>
                                                        <CustomText
                                                            fontSize={theme.fontSize.sm}
                                                            fontFamily={theme.fonts.SEMI_BOLD}
                                                            color={theme.colors.white}
                                                        >
                                                            {service.assignedMember.name.charAt(0).toUpperCase()}
                                                        </CustomText>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.memberDetails}>
                                                <CustomText
                                                    fontSize={theme.fontSize.sm}
                                                    fontFamily={theme.fonts.MEDIUM}
                                                    color={theme.colors.text}
                                                >
                                                    {service.assignedMember.name}
                                                </CustomText>
                                                {service.assignedMember.phone && onCallMember && (
                                                    <Pressable
                                                        style={styles.callButton}
                                                        onPress={() => onCallMember(service.assignedMember!.phone!)}
                                                    >
                                                        <VectoreIcons
                                                            name="call-outline"
                                                            icon="Ionicons"
                                                            size={theme.SF(16)}
                                                            color={theme.colors.primary}
                                                        />
                                                        <CustomText
                                                            fontSize={theme.fontSize.xxs}
                                                            fontFamily={theme.fonts.REGULAR}
                                                            color={theme.colors.primary}
                                                            style={styles.callButtonText}
                                                        >
                                                            Call
                                                        </CustomText>
                                                    </Pressable>
                                                )}
                                            </View>
                                        </View>
                                        {onAssignMember && (
                                            <CustomButton
                                                title="Change Member"
                                                onPress={() => onAssignMember(service)}
                                                backgroundColor={theme.colors.primary_light}
                                                textColor={theme.colors.white}
                                                buttonStyle={styles.changeMemberButton}
                                                buttonTextStyle={styles.changeMemberButtonText}
                                            />
                                        )}
                                    </>
                                ) : (
                                    onAssignMember && (
                                        <CustomButton
                                            title="Assign Member"
                                            onPress={() => onAssignMember(service)}
                                            backgroundColor={theme.colors.primary}
                                            textColor={theme.colors.white}
                                            buttonStyle={styles.assignMemberButton}
                                            buttonTextStyle={styles.assignMemberButtonText}
                                        />
                                    )
                                )}
                            </View>
                        )}

                        {/* Add AddOns Button - Only in booking-detail page */}
                        {pageName === 'booking-detail' && onAddAddOns && (
                            <View style={styles.addOnsActionContainer}>
                                <CustomButton
                                    title="Add More AddOns"
                                    onPress={() => onAddAddOns(service)}
                                    backgroundColor={theme.colors.primary_light}
                                    textColor={theme.colors.primary}
                                    buttonStyle={styles.addAddOnsButton}
                                    buttonTextStyle={styles.addAddOnsButtonText}
                                />
                            </View>
                        )}
                    </View>
                );
            })}

        </View>
    );
}

const createStyles = (theme: ThemeType) => {
    const { colors: Colors, SF, fonts: Fonts, SW, SH } = theme;
    return StyleSheet.create({
        section: {
            paddingHorizontal: SW(20),
            paddingVertical: SH(20),
            borderBottomWidth: 1,
            borderBottomColor: Colors.gray || '#E0E0E0',
        },
        sectionTitle: {
            fontSize: SF(16),
            fontFamily: Fonts.SEMI_BOLD,
            color: Colors.text,
            marginBottom: SH(16),
        },
        serviceCard: {
            padding: SW(12),
            backgroundColor: Colors.background || '#F5F5F5',
            borderRadius: SF(8),
            marginBottom: SH(8),
        },
        serviceInfo: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            flex: 1,
        },
        serviceDetails: {
            marginLeft: SW(12),
            flex: 1,
        },
        serviceName: {
            fontSize: SF(14),
            fontFamily: Fonts.MEDIUM,
            color: Colors.text,
            marginBottom: SH(2),
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SW(8),
        },
        servicePrice: {
            fontSize: SF(12),
            fontFamily: Fonts.REGULAR,
            color: Colors.textAppColor || Colors.text,
            marginBottom: SH(8),
        },
        originalPrice: {
            fontSize: SF(11),
            fontFamily: Fonts.REGULAR,
            color: Colors.lightText || Colors.text,
            textDecorationLine: 'line-through',
            marginBottom: SH(2),
        },
        addOnsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SW(8),
            marginTop: SH(4),
        },
        addOnTag: {
            backgroundColor: Colors.secondary || '#E3F2FD',
            paddingHorizontal: SW(8),
            paddingVertical: SH(4),
            borderRadius: SF(4),
        },
        addOnTagText: {
            fontSize: SF(11),
            fontFamily: Fonts.REGULAR,
            color: Colors.primary,
        },
        serviceActions: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: SH(8),
            gap: SW(8),
        },
        addAddOnButton: {
            paddingHorizontal: SW(12),
            paddingVertical: SH(2),
            backgroundColor: Colors.primary,
            borderRadius: SF(6),
        },
        addAddOnText: {
            fontSize: SF(12),
            fontFamily: Fonts.MEDIUM,
            color: Colors.white,
        },
        removeButton: {
            padding: SW(4),
            position: 'absolute',
            right: 0,
            backgroundColor: Colors.primary,
            top: 0,
            zIndex: 99999,
            borderTopRightRadius: SF(8),
        },
        addServiceButton: {
            paddingVertical: SH(8),
        },
        addServiceText: {
            fontSize: SF(14),
            fontFamily: Fonts.MEDIUM,
            color: Colors.primary,
        },
        serviceImageContainer: {
            width: SW(40),
            height: SH(40),
            borderRadius: SF(20),
            overflow: 'hidden',
        },
        serviceImage: {
            width: '100%',
            height: '100%',
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.gray,
            marginVertical: theme.SH(8),
        },
        offersContainer: {
            marginTop: SH(8),
            gap: SH(8),
        },
        offerItem: {
            backgroundColor: Colors.secondary || '#E3F2FD',
            paddingHorizontal: SW(12),
            paddingVertical: SH(10),
            borderRadius: SF(6),
        },
        offerContent: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: SW(10),
        },
        offerInfo: {
            flex: 1,
        },
        offerTitle: {
            fontSize: SF(12),
            fontFamily: Fonts.MEDIUM,
            color: Colors.primary,
            marginBottom: SH(4),
        },
        discountAmount: {
            fontSize: SF(11),
            fontFamily: Fonts.REGULAR,
            color: Colors.textAppColor || Colors.text,
        },
        appliedOfferContainer: {
            marginTop: SH(8),
            backgroundColor: '#E8F5E9',
            paddingHorizontal: SW(12),
            paddingVertical: SH(10),
            borderRadius: SF(6),
            borderWidth: 1,
            borderColor: '#34eb37',
        },
        appliedOfferContent: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: SW(10),
        },
        appliedOfferInfo: {
            flex: 1,
        },
        appliedOfferTitle: {
            fontSize: SF(12),
            fontFamily: Fonts.MEDIUM,
            color: '#34eb37',
            marginBottom: SH(4),
        },
        appliedDiscountAmount: {
            fontSize: SF(11),
            fontFamily: Fonts.REGULAR,
            color: Colors.textAppColor || Colors.text,
        },
        memberSection: {
            marginTop: SH(12),
            paddingTop: SH(12),
            borderTopWidth: 1,
            borderTopColor: Colors.gray || '#E0E0E0',
        },
        memberInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SH(12),
        },
        avatarContainer: {
            width: SW(40),
            height: SH(40),
            borderRadius: SF(20),
            overflow: 'hidden',
            backgroundColor: Colors.gray || '#F5F5F5',
            marginRight: SW(12),
        },
        avatar: {
            width: '100%',
            height: '100%',
        },
        avatarPlaceholder: {
            width: '100%',
            height: '100%',
            backgroundColor: Colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        memberDetails: {
            flex: 1,
        },
        callButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: SH(4),
            gap: SW(4),
        },
        callButtonText: {
            marginLeft: SW(4),
        },
        assignMemberButton: {
            borderRadius: SF(8),
            paddingVertical: SH(8),
        },
        assignMemberButtonText: {
            fontSize: SF(12),
            fontFamily: Fonts.MEDIUM,
        },
        changeMemberButton: {
            borderRadius: SF(8),
            paddingVertical: SH(8),
        },
        changeMemberButtonText: {
            fontSize: SF(12),
            fontFamily: Fonts.MEDIUM,
        },
        addOnsActionContainer: {
            marginTop: SH(8),
        },
        addAddOnsButton: {
            borderRadius: SF(8),
            paddingVertical: SH(8),
            backgroundColor: Colors.secondary || '#E3F2FD',
            borderWidth: 1,
            borderColor: Colors.primary,
        },
        addAddOnsButtonText: {
            fontSize: SF(12),
            fontFamily: Fonts.MEDIUM,
            color: Colors.primary,
        },
    });
};
