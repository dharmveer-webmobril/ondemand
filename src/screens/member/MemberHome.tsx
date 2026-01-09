import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { StatusBar } from 'react-native';
import { Container, CustomText, ImageLoader, VectoreIcons } from '@components';
import { useThemeContext } from '@utils/theme';
import { SW, SH } from '@utils/dimensions';
import imagePaths from '@assets';

type JobStatus = 'Upcoming' | 'Pending' | 'Completed';

type Job = {
  id: string;
  customerName: string;
  service: string;
  location: string;
  date: string;
  time: string;
  price: string;
  status: JobStatus;
  customerImage?: any;
};

export default function MemberHome() {
  const theme = useThemeContext();
  const [isAvailable, setIsAvailable] = useState(true);
  const [notificationCount] = useState(2);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Mock data - replace with actual API data
  const jobs: Job[] = [
    {
      id: '1',
      customerName: 'Rajesh Kumar',
      service: 'Plumbing Repair',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$80',
      status: 'Upcoming',
      customerImage: imagePaths.barber1,
    },
    {
      id: '2',
      customerName: 'Rajesh Kumar',
      service: 'AC Maintenance',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$60',
      status: 'Completed',
      customerImage: imagePaths.barber1,
    },
    {
      id: '3',
      customerName: 'Ashutosh Pandey',
      service: 'Plumbing Repair',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$120',
      status: 'Pending',
      customerImage: imagePaths.barber1,
    },
    {
      id: '4',
      customerName: 'Rajesh Kumar',
      service: 'AC Maintenance',
      location: '123, 5th Cross, Koramangala 4....',
      date: 'Friday 5 December, 2025',
      time: '10:00 AM',
      price: '$75',
      status: 'Upcoming',
      customerImage: imagePaths.barber1,
    },
  ];

  const todayJobsCount = 6;
  const pendingCount = 2;
  const completedCount = 45;

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'Completed':
        return '#4CAF50';
      case 'Pending':
        return '#FAAC00';
      case 'Upcoming':
        return '#009BFF';
      default:
        return theme.colors.text;
    }
  };

  return (
    <Container style={styles.container} statusBarColor="#2C2C2C" barStyle="light-content">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.profileSection}>
          <ImageLoader
            source={imagePaths.barber1}
            mainImageStyle={styles.profileImage}
            resizeMode="cover"
            fallbackImage={imagePaths.barber1}
          />
          <View style={styles.profileInfo}>
            <CustomText
              variant="h3"
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.white}
            >
              Dinesh Doeg
            </CustomText>
            <CustomText
              variant="h5"
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.white}
              style={styles.roleText}
            >
              House Cleaning
            </CustomText>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.notificationButton}>
            <VectoreIcons
              icon="Ionicons"
              name="notifications-outline"
              size={theme.SF(24)}
              color={theme.colors.white}
            />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <CustomText
                  fontSize={theme.fontSize.xxs}
                  fontFamily={theme.fonts.SEMI_BOLD}
                  color={theme.colors.white}
                >
                  {notificationCount}
                </CustomText>
              </View>
            )}
          </Pressable>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={theme.colors.white}
            style={styles.switch}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <VectoreIcons
                icon="FontAwesome5"
                name="briefcase"
                size={theme.SF(20)}
                color="#009BFF"
              />
            </View>
            <CustomText
              variant="h2"
              fontFamily={theme.fonts.BOLD}
              color={theme.colors.text}
              style={styles.statNumber}
            >
              {todayJobsCount.toString().padStart(2, '0')}
            </CustomText>
            <CustomText
              variant="h6"
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.lightText}
            >
              Today's Jobs
            </CustomText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF8E1' }]}>
              <VectoreIcons
                icon="Ionicons"
                name="time-outline"
                size={theme.SF(20)}
                color="#FAAC00"
              />
            </View>
            <CustomText
              variant="h2"
              fontFamily={theme.fonts.BOLD}
              color={theme.colors.text}
              style={styles.statNumber}
            >
              {pendingCount.toString().padStart(2, '0')}
            </CustomText>
            <CustomText
              variant="h6"
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.lightText}
            >
              Pending
            </CustomText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <VectoreIcons
                icon="MaterialIcons"
                name="check-circle"
                size={theme.SF(20)}
                color="#4CAF50"
              />
            </View>
            <CustomText
              variant="h2"
              fontFamily={theme.fonts.BOLD}
              color={theme.colors.text}
              style={styles.statNumber}
            >
              {completedCount}
            </CustomText>
            <CustomText
              variant="h6"
              fontFamily={theme.fonts.REGULAR}
              color={theme.colors.lightText}
            >
              Completed
            </CustomText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Pressable style={styles.quickActionCard}>
            <View style={[styles.quickActionIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <VectoreIcons
                icon="MaterialIcons"
                name="check-circle"
                size={theme.SF(24)}
                color="#4CAF50"
              />
            </View>
            <CustomText
              variant="h5"
              fontFamily={theme.fonts.MEDIUM}
              color={theme.colors.text}
              style={styles.quickActionText}
            >
              Mark Available
            </CustomText>
          </Pressable>

          <Pressable style={styles.quickActionCard}>
            <View style={[styles.quickActionIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <VectoreIcons
                icon="MaterialIcons"
                name="calendar-today"
                size={theme.SF(24)}
                color="#009BFF"
              />
            </View>
            <CustomText
              variant="h5"
              fontFamily={theme.fonts.MEDIUM}
              color={theme.colors.text}
              style={styles.quickActionText}
            >
              Calendar
            </CustomText>
          </Pressable>
        </View>

        {/* All Jobs Section */}
        <View style={styles.jobsSection}>
          <View style={styles.sectionHeader}>
            <CustomText
              variant="h3"
              fontFamily={theme.fonts.BOLD}
              color={theme.colors.text}
            >
              All Jobs
            </CustomText>
            <Pressable>
              <CustomText
                variant="h5"
                fontFamily={theme.fonts.MEDIUM}
                color={theme.colors.primary}
              >
                View All
              </CustomText>
            </Pressable>
          </View>

          {jobs.map((job) => (
            <Pressable key={job.id} style={styles.jobCard}>
              <ImageLoader
                source={job.customerImage}
                mainImageStyle={styles.customerImage}
                resizeMode="cover"
                fallbackImage={imagePaths.barber1}
              />
              <View style={styles.jobContent}>
                <View style={styles.jobHeader}>
                  <CustomText
                    variant="h4"
                    fontFamily={theme.fonts.SEMI_BOLD}
                    color={theme.colors.text}
                  >
                    {job.customerName}
                  </CustomText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                    <CustomText
                      fontSize={theme.fontSize.xxs}
                      fontFamily={theme.fonts.SEMI_BOLD}
                      color={theme.colors.white}
                    >
                      {job.status}
                    </CustomText>
                  </View>
                </View>

                <CustomText
                  variant="h5"
                  fontFamily={theme.fonts.MEDIUM}
                  color={theme.colors.text}
                  style={styles.serviceText}
                >
                  {job.service}
                </CustomText>

                <View style={styles.jobDetailRow}>
                  <VectoreIcons
                    icon="Ionicons"
                    name="location-outline"
                    size={theme.SF(14)}
                    color={theme.colors.lightText}
                  />
                  <CustomText
                    variant="h6"
                    fontFamily={theme.fonts.REGULAR}
                    color={theme.colors.lightText}
                    style={styles.detailText}
                    numberOfLines={1}
                  >
                    {job.location}
                  </CustomText>
                </View>

                <View style={styles.jobDetailRow}>
                  <VectoreIcons
                    icon="MaterialIcons"
                    name="calendar-today"
                    size={theme.SF(14)}
                    color={theme.colors.lightText}
                  />
                  <CustomText
                    variant="h6"
                    fontFamily={theme.fonts.REGULAR}
                    color={theme.colors.lightText}
                    style={styles.detailText}
                  >
                    {job.date} {job.time}
                  </CustomText>
                </View>

                <View style={styles.jobFooter}>
                  <CustomText
                    variant="h3"
                    fontFamily={theme.fonts.BOLD}
                    color={theme.colors.primary}
                  >
                    {job.price}
                  </CustomText>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    headerSection: {
      backgroundColor: '#2C2C2C',
      paddingTop: theme.SH(50),
      paddingBottom: theme.SH(20),
      paddingHorizontal: theme.SW(16),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    profileImage: {
      width: theme.SW(60),
      height: theme.SW(60),
      borderRadius: theme.SW(30),
      marginRight: theme.SW(12),
    },
    profileInfo: {
      flex: 1,
    },
    roleText: {
      marginTop: theme.SH(4),
      opacity: 0.9,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(16),
    },
    notificationButton: {
      position: 'relative',
      padding: theme.SW(4),
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: '#F50000',
      borderRadius: theme.SW(10),
      minWidth: theme.SW(18),
      height: theme.SH(18),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.SW(4),
    },
    switch: {
      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.SH(20),
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(20),
      gap: theme.SW(12),
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statIconContainer: {
      width: theme.SW(40),
      height: theme.SW(40),
      borderRadius: theme.SW(20),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.SH(8),
    },
    statNumber: {
      marginBottom: theme.SH(4),
    },
    quickActionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(16),
      gap: theme.SW(12),
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionIconContainer: {
      width: theme.SW(48),
      height: theme.SW(48),
      borderRadius: theme.SW(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.SH(8),
    },
    quickActionText: {
      textAlign: 'center',
    },
    jobsSection: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(24),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.SH(16),
    },
    jobCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      marginBottom: theme.SH(16),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    customerImage: {
      width: theme.SW(60),
      height: theme.SW(60),
      borderRadius: theme.SW(30),
      marginRight: theme.SW(12),
    },
    jobContent: {
      flex: 1,
    },
    jobHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.SH(4),
    },
    statusBadge: {
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(4),
      borderRadius: theme.borderRadius.sm,
    },
    serviceText: {
      marginBottom: theme.SH(8),
    },
    jobDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.SH(4),
    },
    detailText: {
      marginLeft: theme.SW(6),
      flex: 1,
    },
    jobFooter: {
      marginTop: theme.SH(8),
    },
  });

