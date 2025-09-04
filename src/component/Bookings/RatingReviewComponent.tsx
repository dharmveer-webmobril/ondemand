import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts, formatChatTimestamp, SF, SH, SW } from '../../utils';
import { AppText, Buttons, } from '../../component';
import StarRating from 'react-native-star-rating-widget';

const RatingReviewComponent: React.FC<{
    activeTab: number;
    ratingData: any;
    isLoading: boolean;
    onAddRating: () => void;
    bookingId: string;
    provider?: any;
    service?: any;
}> = ({ activeTab, ratingData, isLoading, onAddRating }) => {
    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.themeColor} />
            </View>
        );
    }

    if (!ratingData) {
        return (
            <View style={styles.noRatingBox}>
                <AppText style={styles.noRatingText}>
                    You haven't rated this {activeTab === 1 ? 'provider' : 'service'}
                </AppText>
                <Buttons
                    buttonStyle={styles.addRatingButton}
                    buttonTextStyle={styles.addRatingButtonText}
                    onPress={onAddRating}
                    title="Add Rating"
                />
            </View>
        );
    }

    return (
        <>
            <View style={styles.ratingRow}>
                <View style={styles.ratingContainer}>
                    <StarRating
                        starStyle={styles.starStyle}
                        onChange={() => { }}
                        starSize={SF(16)}
                        color={Colors.ratingColor1}
                        rating={ratingData?.rating ? Number(ratingData?.rating) : 0}
                    />
                    <AppText style={styles.ratingtxt}>{ratingData?.rating}</AppText>
                </View>
                <AppText style={styles.reviewDate}>
                    {ratingData?.createdAt ? formatChatTimestamp(ratingData?.createdAt) : ''}
                </AppText>
            </View>
            <AppText style={styles.reviewText}>{ratingData?.comment}</AppText>
        </>
    );
};

export default RatingReviewComponent

const styles = StyleSheet.create({
    loaderContainer: {
        height: SH(90),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noRatingBox: {
        height: SH(90),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noRatingText: {
        fontSize: SF(10),
        fontFamily: Fonts.REGULAR,
        color: Colors.textAppColor,
        marginBottom: 10,
    },
    addRatingButton: {
        width: '50%',
        height: SH(35),
    },
    addRatingButtonText: {
        fontSize: SF(10),
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SH(10),
    },
    ratingContainer: {
        width: SW(90),
        flexDirection: 'row',
        alignItems: 'center',
    },
    starStyle: {
        marginHorizontal: 0,
    },
    ratingtxt: {
        color: '#6C757D',
        fontFamily: Fonts.MEDIUM,
        marginLeft: 5,
        fontSize: SF(14),
    },
    reviewDate: {
        fontFamily: Fonts.MEDIUM,
        color: '#6C757D',
        textAlign: 'right',
        fontSize: SF(14),
    },
    reviewText: {
        fontFamily: Fonts.REGULAR,
        color: Colors.textAppColor,
        textAlign: 'left',
        marginTop: SH(10),
        fontSize: SF(10),
        lineHeight: SF(16),
    },
});

