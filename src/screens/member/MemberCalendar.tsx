import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, ImageLoader, VectoreIcons } from '@components';
import { useThemeContext } from '@utils/theme';
import imagePaths from '@assets';

type JobStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Pending';

type Job = {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: JobStatus;
  customerImage?: any;
};

export default function MemberCalendar() {
  const { t } = useTranslation();
  const theme = useThemeContext();
  const [selectedDate, setSelectedDate] = useState<string>('2025-03-06');
  const [currentMonth, setCurrentMonth] = useState<string>('2025-03');

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Mock data - replace with actual API data
  // Format: 'YYYY-MM-DD': [jobs]
  const jobsByDate: Record<string, Job[]> = {
    '2025-03-06': [
      {
        id: '1',
        customerName: 'Rajesh Kumar',
        service: 'Plumbing Repair',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
      {
        id: '2',
        customerName: 'Ashutosh Pandey',
        service: 'AC Maintenance',
        date: 'Friday 5 December, 2025',
        time: '02:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
      {
        id: '3',
        customerName: 'Rajesh Kumar',
        service: 'Plumbing Repair',
        date: 'Friday 5 December, 2025',
        time: '04:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-08': [
      {
        id: '4',
        customerName: 'Rajesh Kumar',
        service: 'AC Maintenance',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-09': [
      {
        id: '5',
        customerName: 'Ashutosh Pandey',
        service: 'Plumbing Repair',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-10': [
      {
        id: '6',
        customerName: 'Rajesh Kumar',
        service: 'AC Maintenance',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Completed',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-14': [
      {
        id: '7',
        customerName: 'Ashutosh Pandey',
        service: 'Plumbing Repair',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'In Progress',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-15': [
      {
        id: '8',
        customerName: 'Rajesh Kumar',
        service: 'AC Maintenance',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Pending',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-19': [
      {
        id: '9',
        customerName: 'Rajesh Kumar',
        service: 'Plumbing Repair',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-20': [
      {
        id: '10',
        customerName: 'Ashutosh Pandey',
        service: 'AC Maintenance',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Pending',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-22': [
      {
        id: '11',
        customerName: 'Rajesh Kumar',
        service: 'Plumbing Repair',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-23': [
      {
        id: '12',
        customerName: 'Ashutosh Pandey',
        service: 'AC Maintenance',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-29': [
      {
        id: '13',
        customerName: 'Rajesh Kumar',
        service: 'Plumbing Repair',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
    '2025-03-30': [
      {
        id: '14',
        customerName: 'Ashutosh Pandey',
        service: 'AC Maintenance',
        date: 'Friday 5 December, 2025',
        time: '10:00 AM',
        status: 'Upcoming',
        customerImage: imagePaths.barber1,
      },
    ],
  };

  // Get status color for a date
  const getDateStatusColor = (date: string): string | null => {
    const jobs = jobsByDate[date];
    if (!jobs || jobs.length === 0) return null;

    // Priority: In Progress > Pending > Completed > Upcoming
    if (jobs.some((j) => j.status === 'In Progress')) return '#F50000'; // Red
    if (jobs.some((j) => j.status === 'Pending')) return '#FAAC00'; // Yellow
    if (jobs.some((j) => j.status === 'Completed')) return '#4CAF50'; // Green
    if (jobs.some((j) => j.status === 'Upcoming')) return '#009BFF'; // Blue
    return null;
  };

  // Create marked dates object for calendar
  const markedDates = useMemo(() => {
    const marked: any = {};
    
    // First, mark all dates with jobs
    Object.keys(jobsByDate).forEach((date) => {
      const color = getDateStatusColor(date);
      if (color) {
        const isSelected = date === selectedDate;
        marked[date] = {
          selected: isSelected,
          selectedColor: color,
          selectedTextColor: '#FFFFFF',
          marked: true,
          dotColor: color,
          customStyles: {
            container: {
              backgroundColor: color,
              borderRadius: theme.borderRadius.sm,
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? '#009BFF' : undefined,
            },
            text: {
              color: '#FFFFFF',
              fontWeight: isSelected ? 'bold' : 'normal',
            },
          },
        };
      }
    });

    // Handle selected date - if it has jobs, add border; if not, show border only
    if (selectedDate) {
      if (marked[selectedDate]) {
        // Date has jobs - add border to existing colored background
        marked[selectedDate].customStyles.container.borderWidth = 2;
        marked[selectedDate].customStyles.container.borderColor = '#009BFF';
      } else {
        // Date has no jobs - show border only
        marked[selectedDate] = {
          selected: true,
          selectedColor: undefined,
          selectedTextColor: theme.colors.text,
          customStyles: {
            container: {
              borderWidth: 2,
              borderColor: '#009BFF',
              borderRadius: theme.borderRadius.md,
              backgroundColor: 'transparent',
            },
            text: {
              color: theme.colors.text,
              fontWeight: 'bold',
            },
          },
        };
      }
    }

    return marked;
  }, [selectedDate, theme]);

  const selectedDateJobs = jobsByDate[selectedDate] || [];

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const handleMonthChange = useCallback((month: DateData) => {
    setCurrentMonth(month.dateString.substring(0, 7));
  }, []);

  const handleJobPress = useCallback((jobId: string) => {
    // TODO: Navigate to job details
    console.log('View job:', jobId);
  }, []);

  const renderJobCard = (job: Job) => (
    <Pressable
      key={job.id}
      style={styles.jobCard}
      onPress={() => handleJobPress(job.id)}
      android_ripple={{ color: theme.colors.gray || '#F5F5F5' }}
    >
      <View style={styles.jobIconContainer}>
        <VectoreIcons
          icon="FontAwesome5"
          name="briefcase"
          size={theme.SF(20)}
          color="#009BFF"
        />
      </View>
      <View style={styles.jobContent}>
        <CustomText
          variant="h4"
          fontFamily={theme.fonts.SEMI_BOLD}
          color={theme.colors.text}
        >
          {job.service} - {job.customerName}
        </CustomText>
        <CustomText
          variant="h6"
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.lightText}
          style={styles.jobDateTime}
        >
          {job.date} {job.time}
        </CustomText>
      </View>
    </Pressable>
  );

  return (
    <Container style={styles.container}>
      <AppHeader
        title={t('member.calendar')}
        onLeftPress={() => {
          // TODO: Navigate back
          console.log('Navigate back');
        }}
        leftIconName="angle-left"
        leftIconFamily="FontAwesome"
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
          <Calendar
            current={currentMonth}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            markingType="custom"
            theme={{
              backgroundColor: theme.colors.white,
              calendarBackground: theme.colors.white,
              textSectionTitleColor: theme.colors.text,
              selectedDayBackgroundColor: '#009BFF',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.lightText,
              dotColor: '#009BFF',
              selectedDotColor: '#FFFFFF',
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text,
              textDayFontFamily: theme.fonts.REGULAR,
              textMonthFontFamily: theme.fonts.SEMI_BOLD,
              textDayHeaderFontFamily: theme.fonts.MEDIUM,
              textDayFontSize: theme.fontSize.sm,
              textMonthFontSize: theme.fontSize.lg,
              textDayHeaderFontSize: theme.fontSize.xs,
              'stylesheet.calendar.header': {
                week: {
                  marginTop: theme.SH(10),
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingBottom: theme.SH(10),
                },
              },
            }}
            style={styles.calendar}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#009BFF' }]} />
            <CustomText variant="h6" fontFamily={theme.fonts.REGULAR} color={theme.colors.text}>
              Upcoming
            </CustomText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F50000' }]} />
            <CustomText variant="h6" fontFamily={theme.fonts.REGULAR} color={theme.colors.text}>
              In Progress
            </CustomText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <CustomText variant="h6" fontFamily={theme.fonts.REGULAR} color={theme.colors.text}>
              Completed
            </CustomText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FAAC00' }]} />
            <CustomText variant="h6" fontFamily={theme.fonts.REGULAR} color={theme.colors.text}>
              Pending
            </CustomText>
          </View>
        </View>

        {/* Jobs for selected date */}
        <View style={styles.jobsSection}>
          <CustomText
            variant="h3"
            fontFamily={theme.fonts.BOLD}
            color={theme.colors.text}
            style={styles.sectionTitle}
          >
            Jobs on {new Date(selectedDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric' 
            })}
          </CustomText>
          {selectedDateJobs.length > 0 ? (
            selectedDateJobs.map(renderJobCard)
          ) : (
            <View style={styles.emptyContainer}>
              <CustomText
                variant="h5"
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
              >
                No jobs scheduled for this date
              </CustomText>
            </View>
          )}
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.SH(20),
    },
    calendarContainer: {
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(16),
    },
    calendar: {
      borderRadius: theme.borderRadius.lg,
      paddingBottom: theme.SH(10),
    },
    legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(16),
      paddingBottom: theme.SH(8),
      gap: theme.SW(16),
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(6),
    },
    legendDot: {
      width: theme.SW(12),
      height: theme.SW(12),
      borderRadius: theme.SW(6),
    },
    jobsSection: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(24),
    },
    sectionTitle: {
      marginBottom: theme.SH(16),
    },
    jobCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      padding: theme.SW(16),
      marginBottom: theme.SH(12),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.gray || '#E5E5E5',
    },
    jobIconContainer: {
      width: theme.SW(40),
      height: theme.SW(40),
      borderRadius: theme.SW(20),
      backgroundColor: '#E3F2FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.SW(12),
    },
    jobContent: {
      flex: 1,
    },
    jobDateTime: {
      marginTop: theme.SH(4),
    },
    emptyContainer: {
      paddingVertical: theme.SH(40),
      alignItems: 'center',
    },
  });

