/**
 * Time Slot Utility Functions
 * Handles time slot generation and formatting
 */

export type TimeSlot = {
  id: string;
  time: string; // 24-hour format (HH:mm)
  available: boolean;
};

// Configurable slot interval in minutes (default 30)
export const SLOT_INTERVAL_MINUTES = 30;

/**
 * Parse time string (12-hour format with AM/PM) to minutes
 * @param timeStr - Time string in format "10:00 AM" or "07:00 PM"
 * @returns Total minutes from midnight
 */
const parseTimeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;
  
  if (period?.toUpperCase() === 'PM' && hours !== 12) {
    totalMinutes += 12 * 60;
  } else if (period?.toUpperCase() === 'AM' && hours === 12) {
    totalMinutes -= 12 * 60;
  }
  
  return totalMinutes;
};

/**
 * Format minutes to 24-hour format string (HH:mm)
 * @param minutes - Total minutes from midnight
 * @returns Time string in 24-hour format (e.g., "14:30", "09:00")
 */
const formatTimeTo24Hour = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Generate time slots based on start and end time
 * @param startTime - Start time in 12-hour format (e.g., "10:00 AM")
 * @param endTime - End time in 12-hour format (e.g., "07:00 PM")
 * @param isClose - Whether the service is closed
 * @param intervalMinutes - Interval between slots in minutes (default: SLOT_INTERVAL_MINUTES)
 * @returns Array of time slots in 24-hour format
 */
export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  isClose: boolean,
  intervalMinutes: number = SLOT_INTERVAL_MINUTES
): TimeSlot[] => {
  if (isClose) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  let currentMinutes = startMinutes;
  let slotId = 1;

  while (currentMinutes < endMinutes) {
    slots.push({
      id: `slot-${slotId}`,
      time: formatTimeTo24Hour(currentMinutes),
      available: true,
    });
    currentMinutes += intervalMinutes;
    slotId++;
  }

  return slots;
};

/**
 * Convert 24-hour format to 12-hour format for display
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format with AM/PM (e.g., "2:30 PM")
 */
export const format24To12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

/**
 * Convert 12-hour format to 24-hour format
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM")
 * @returns Time in 24-hour format (e.g., "14:30")
 */
export const format12To24Hour = (time12: string): string => {
  const minutes = parseTimeToMinutes(time12);
  return formatTimeTo24Hour(minutes);
};
