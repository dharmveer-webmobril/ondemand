import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import imagePaths from '../../assets/images';
import StarRating from 'react-native-star-rating-widget';
import { Colors, Fonts, SF, SH, SW, formatChatTimestamp } from '../../utils';
import { AppText, VectoreIcons } from '../../component';

interface RatingBreakdown {
    star: number;
    count: number;
    percentage: string;
}

interface Review {
    id: string;
    name: string;
    date: string;
    rating: number;
    comment: string;
    likes?: number;
    replies?: number;
    verified?: boolean;
    reply?: string;
    profilePic?: string;
}

interface ReviewInterface {
    ratingData: any;
}

const Reviews: React.FC<ReviewInterface> = ({ ratingData }) => {
    console.log('ratingDataratingData', ratingData);

    // Transform ratingBreakdown from ratingData
    const ratingsBreakdown: RatingBreakdown[] = ratingData?.ratingBreakdown?.map((item: any) => ({
        star: item.star,
        count: item.count,
        percentage: item.percentage,
    })) || [
            { star: 5, count: 0, percentage: '0%' },
            { star: 4, count: 0, percentage: '0%' },
            { star: 3, count: 0, percentage: '0%' },
            { star: 2, count: 0, percentage: '0%' },
            { star: 1, count: 0, percentage: '0%' },
        ];

    console.log('ratingsBreakdownratingsBreakdown', ratingsBreakdown);

    // Transform reviews from ratingData
    const reviews: Review[] = ratingData?.reviews?.map((item: any, index: number) => ({
        id: item._id || index.toString(),
        name: item.userId?.fullName || 'Unknown User',
        date: item.createdAt ? formatChatTimestamp(item.createdAt) : 'Unknown Date',
        rating: item.rating || 0,
        comment: item.comment || '',
        profilePic: item?.userId?.profilePic,
        likes: 0, // No likes data in JSON, default to 0
        replies: 0, // No replies data in JSON, default to 0
        verified: true, // Assuming all users are verified for now
        reply: undefined, // No reply data in JSON
    })) || [];

    if (!ratingData || ratingData?.reviews?.length <= 0) {
        return (
            <View style={styles.noDataContainer}>
                <Image source={imagePaths.no_user_img} style={styles.noDataImage} />
                <AppText style={styles.noDataText}>No Reviews Available</AppText>
                <AppText style={styles.noDataSubText}>
                    Be the first to share your experience!
                </AppText>
            </View>
        );
    }

    const renderItem = ({ item }: { item: Review }) => {
        console.log('item?.userId?.profilePicitem?.userId?.profilePic', item);

        return (
            <View style={styles.reviewItem}>
                <View style={styles.userRow}>
                    <Image
                        source={item?.profilePic ? { uri: item?.profilePic } : imagePaths?.no_user_img}
                        style={styles.avatar}
                    />
                    <View style={styles.nameRow}>
                        <View style={styles.usrNameDateContainer}>
                            <AppText style={styles.userName}>{item.name}</AppText>
                            <AppText style={styles.dotText}> . </AppText>
                            <AppText style={styles.dateText}>{item.date}</AppText>
                        </View>
                        <StarRating
                            starStyle={styles.starStyleForUser}
                            onChange={() => { }}
                            color={Colors.ratingColor1}
                            starSize={SF(10)}
                            rating={item.rating}
                        />
                    </View>
                    {item.verified && (
                        <AppText style={styles.verifiedUser}>
                            Verified User ✅
                        </AppText>
                    )}
                </View>

                <AppText style={styles.comment}>{item.comment}</AppText>

                <View style={styles.actionRow}>
                    {/* <AppText style={styles.actionText}>
                        <VectoreIcons name="thumbs-up" icon="Feather" size={SF(9)} /> {item.likes}
                    </AppText>
                    <AppText style={styles.actionTextWithMargin}>
                        <VectoreIcons name="thumbs-down" icon="Feather" size={SF(9)} /> {item.replies}
                    </AppText> */}
                    {/* <TouchableOpacity style={styles.reportButton}>
                        <AppText style={styles.reportText}>
                            Report <AppText style={styles.reportIcon}>⚑</AppText>
                        </AppText>
                    </TouchableOpacity> */}
                </View>

                {/* {item.reply && (
                    <View style={styles.replyBox}>
                        <View>
                            <Image style={styles.replyArrow} source={imagePaths.return_up_back} />
                        </View>
                        <View style={styles.replyContent}>
                            <AppText style={styles.replyTitle}>WM Barbershop</AppText>
                            <AppText style={styles.replyDate}>on March 20th</AppText>
                            <AppText style={styles.replyText}>{item.reply}</AppText>
                        </View>
                    </View>
                )} */}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.ratingSummaryRow}>
                <View style={styles.ratingSummary}>
                    <AppText style={styles.ratingNumber}>{ratingData?.averageRating?.toFixed(1) || '0.0'}</AppText>
                    <StarRating
                        starStyle={styles.starStyle}
                        color={Colors.ratingColor1}
                        onChange={() => { }}
                        starSize={SF(12)}
                        rating={ratingData?.averageRating || 0}
                    />
                    <AppText style={styles.averageText}>Average Rating</AppText>
                </View>
                <View style={styles.breakdownContainer}>
                    {ratingsBreakdown.map((item, index) => (
                        <View key={index} style={styles.breakdownRow}>
                            <StarRating
                                starStyle={styles.breakdownStarStyle}
                                onChange={() => { }}
                                starSize={SF(14)}
                                color={Colors.ratingColor1}
                                rating={item.star}
                            />
                            <AppText style={styles.breakdownStarText}>{item.star}</AppText>
                            <View style={styles.barBackground}>
                                <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                            </View>
                            <AppText style={styles.breakdownPercentageText}>{item.percentage}%</AppText>
                        </View>
                    ))}
                </View>
            </View>

            <FlatList
                data={reviews}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    );
};

export default Reviews;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: SH(25),
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SH(20),
        backgroundColor: '#F9F9F9',
        borderRadius: SF(10),
        marginTop: SH(20),
    },
    noDataImage: {
        width: SW(100),
        height: SH(100),
        resizeMode: 'contain',
    },
    noDataText: {
        fontSize: SF(16),
        fontFamily: Fonts.SEMI_BOLD,
        color: Colors.textAppColor,
        marginTop: SH(10),
    },
    noDataSubText: {
        fontSize: SF(12),
        fontFamily: Fonts.REGULAR,
        color: Colors.lightGraytext,
        textAlign: 'center',
        marginTop: SH(5),
    },
    starStyle: {
        marginHorizontal: 0,
        marginTop: 6,
    },
    ratingSummary: {
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#C4C4C439',
        borderWidth: 0.6,
        borderColor: '#C4C4C450',
        paddingVertical: SW(12),
        paddingHorizontal: SW(15),
    },
    ratingNumber: {
        fontSize: SF(18.8),
        fontFamily: Fonts.SEMI_BOLD,
        color: '#1D2026',
    },
    averageText: {
        fontSize: SF(7),
        color: '#1D2026',
        marginTop: 4,
        fontFamily: Fonts.MEDIUM,
    },
    ratingSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    breakdownContainer: {
        marginBottom: 20,
        marginLeft: SW(10),
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
        paddingRight: SW(80),
    },
    breakdownStarStyle: {
        marginHorizontal: 0.5,
    },
    breakdownStarText: {
        marginHorizontal: SW(10),
        fontSize: SF(9),
        color: '#1D2026',
        fontFamily: Fonts.MEDIUM,
    },
    barBackground: {
        height: 6,
        width: '40%',
        backgroundColor: '#9BC5D1',
        overflow: 'hidden',
    },
    barFill: {
        height: 6,
        backgroundColor: '#378CA4',
    },
    breakdownPercentageText: {
        marginLeft: SW(10),
        fontSize: SF(9),
        color: '#1D2026',
        fontFamily: Fonts.MEDIUM,
    },
    reviewItem: {
        paddingVertical: 12,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatar: {
        height: SF(28),
        width: SF(28),
        borderRadius: SF(14),
        backgroundColor: '#ccc',
        marginRight: SF(6),
    },
    nameRow: {
        flex: 1,
    },
    usrNameDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(12),
    },
    dateText: {
        fontSize: SF(8),
        color: '#6E7485',
        fontFamily: Fonts.REGULAR,
    },
    verifiedUser: {
        fontSize: SF(8),
        color: '#6E7485',
        fontFamily: Fonts.REGULAR,
    },
    dotText: {
        fontSize: SF(14),
        color: '#6E7485',
        fontFamily: Fonts.BOLD,
        marginTop: -SH(5),
    },
    starStyleForUser: {
        marginHorizontal: 0,
    },
    comment: {
        fontSize: SF(8),
        marginVertical: SH(4),
        color: '#4E5566',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    actionText: {
        fontSize: SF(9),
        color: '#3D3D3D',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: SW(7),
        paddingVertical: SH(4),
        borderRadius: 4,
    },
    actionTextWithMargin: {
        fontSize: SF(9),
        color: '#3D3D3D',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: SW(7),
        paddingVertical: SH(4),
        borderRadius: 4,
        marginLeft: 16,
    },
    reportButton: {
        marginLeft: 'auto',
    },
    reportText: {
        fontSize: SF(9),
        fontFamily: Fonts.REGULAR,
        color: '#4E5566',
    },
    reportIcon: {
        fontSize: SF(12),
    },
    replyBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F6F6F6',
        padding: 10,
        marginTop: 8,
        borderRadius: 6,
    },
    replyArrow: {
        height: SF(10),
        width: SF(12),
    },
    replyContent: {
        marginLeft: 10,
    },
    replyTitle: {
        fontFamily: Fonts.MEDIUM,
        fontSize: SF(8),
        color: Colors.lightGraytext,
    },
    replyDate: {
        fontFamily: Fonts.REGULAR,
        fontSize: SF(6),
        color: Colors.lightGraytext,
    },
    replyText: {
        fontFamily: Fonts.SEMI_BOLD,
        fontSize: SF(8),
        color: Colors.lightGraytext,
        marginTop: 8,
    },
    flatListContent: {
        paddingBottom: 30,
    },
});