import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import { Fonts, SF, SW } from '../utils';
import VectorIcon from './VectoreIcons';
import imagePaths from '../assets/images';
import AppText from './AppText';

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getStartDayOfWeek = (month: number, year: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday as start
};

type CalendarProps = {
  minDate?: Date;
  maxDate?: Date;
};

type MonthOption = {
  label: string;
  month: number;
  year: number;
};

const Calendar: React.FC<CalendarProps> = ({
  minDate = new Date(2000, 0, 1),
  maxDate = new Date(2100, 11, 31),
}) => {
  const today = new Date();

  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const options: MonthOption[] = [];

    while (start <= end) {
      options.push({
        label: `${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()}`,
        month: start.getMonth(),
        year: start.getFullYear(),
      });
      start.setMonth(start.getMonth() + 1);
    }

    setMonthOptions(options);

    // Set default to the first available month if current is outside range
    const inRange =
      today >= minDate && today <= maxDate
        ? { month: today.getMonth(), year: today.getFullYear() }
        : { month: minDate.getMonth(), year: minDate.getFullYear() };

    setSelectedMonth(inRange.month);
    setSelectedYear(inRange.year);
  }, [minDate, maxDate]);

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const startDay = getStartDayOfWeek(selectedMonth, selectedYear);
  const totalBoxes = Math.ceil((startDay + daysInMonth) / 7) * 7;

  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
  const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

  const calendarDays = Array.from({ length: totalBoxes }, (_, i) => {
    const dayIndex = i - startDay;
    let dateObj: Date;
    let isCurrentMonth = false;

    if (dayIndex < 0) {
      const day = daysInPrevMonth + dayIndex + 1;
      dateObj = new Date(prevYear, prevMonth, day);
    } else if (dayIndex >= daysInMonth) {
      const day = dayIndex - daysInMonth + 1;
      dateObj = new Date(nextYear, nextMonth, day);
    } else {
      const day = dayIndex + 1;
      dateObj = new Date(selectedYear, selectedMonth, day);
      isCurrentMonth = true;
    }

    const isDisabled = dateObj < minDate || dateObj > maxDate;

    return {
      day: dateObj.getDate(),
      isCurrentMonth,
      isDisabled,
      dateObj,
    };
  });

  const handleMonthSelect = (monthObj: MonthOption) => {
    setSelectedMonth(monthObj.month);
    setSelectedYear(monthObj.year);
    setShowMonthPicker(false);
  };

  const getDayColor = (
    index: number,
    isCurrentMonth: boolean,
    isDisabled: boolean
  ) => {
    const dayOfWeek = index % 7;
    if (isDisabled) return '#B0B0B0';
    if (!isCurrentMonth) return '#999';
    if (dayOfWeek === 5) return '#378CA4'; // Saturday
    if (dayOfWeek === 6) return '#378CA4'; // Sunday
    return '#000';
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <View style={styles.container}>
      {/* Month Dropdown */}
      <TouchableOpacity
        onPress={() => setShowMonthPicker(true)}
        style={styles.monthSelector}
      >
        <AppText style={styles.monthText}>
          {MONTH_LABELS[selectedMonth]} {selectedYear}{"   "} 
        </AppText>
        <Image resizeMode='contain' source={imagePaths.drop_down} style={{height:SF(14),width:SF(14)}}/>
      </TouchableOpacity>

      <Modal visible={showMonthPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={monthOptions}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleMonthSelect(item)}>
                  <AppText style={styles.modalMonth}>{item.label}</AppText>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => `${item.month}-${item.year}`}
            />
          </View>
        </View>
      </Modal>

      {/* Weekday Headers */}
      <View style={styles.daysContainer}>
        {WEEK_DAYS.map((day, index) => (
          <View key={`week-${index}`} style={styles.dayBox}>
            <AppText
              style={[
                styles.weekDayText,
                index === 5 && { color: '#378CA4' },
                index === 6 && { color: '#378CA4' },
              ]}
            >
              {day}
            </AppText>
          </View>
        ))}

        {/* Calendar Days */}
        {calendarDays.map(({ day, isCurrentMonth, isDisabled, dateObj }, index) => {
          const isSelected = selectedDate && isSameDay(selectedDate, dateObj);
          return (
            <TouchableOpacity
              key={`day-${index}`}
              disabled={isDisabled}
              onPress={() => {
                if (!isDisabled) setSelectedDate(dateObj);
              }}
              style={[
                styles.dayBox,
                isSelected && styles.selectedDayBox,
              ]}
            >
              <AppText
                style={[
                  styles.dayText,
                  {
                    color: isSelected ? '#fff' : getDayColor(index, isCurrentMonth, isDisabled),
                    // fontWeight: isSelected ? 'bold' : 'normal',
                  },
                ]}
              >
                {day}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  monthSelector: {
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent:"space-between",
    flexDirection:'row'
  },
  monthText: {
    fontSize: SF(14),
    fontFamily: Fonts.SEMI_BOLD,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBox: {
    width: `${(100 / 7)}%`,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: 20,
  },
  selectedDayBox: {
    backgroundColor: '#378CA4',
    width: `${(100 / 7)}%`,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: 6,
  },
  dayText: {
    fontSize: SF(12),
    fontFamily: Fonts.REGULAR,
    color: '#616161',
  },
  weekDayText: {
    fontSize: SF(12),
    fontFamily: Fonts.REGULAR,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    maxHeight: 300,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
  },
  modalMonth: {
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});
