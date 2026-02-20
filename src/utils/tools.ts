
import { Colors } from "./theme";
import { Platform, Alert } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';


const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
    } catch {
        return dateString;
    }
};

const formatBookingAddress = (booking: any): string => {
    if (booking.addressId) {
        const addr = booking.addressId;
        const parts = [addr.line1];
        if (addr.line2) parts.push(addr.line2);
        if (addr.landmark) parts.push(addr.landmark);
        return parts.join(', ');
    }
    return 'Address not available';
};

// Map API booking status to display-friendly status
type DisplayStatus = 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | 'CANCELLED' | 'ONTHEWAY' | 'REACHED' | 'ONGOING' | 'COMPLETED';
type ListStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

const mapBookingStatusToDisplay = (status: string): DisplayStatus => {
    const statusMap: Record<string, DisplayStatus> = {
        'requested': 'REQUESTED',
        'accepted': 'ACCEPTED',
        'rejected': 'REJECTED',
        'rescheduledByCustomer': 'RESCHEDULED',
        'rescheduledBySp': 'RESCHEDULED',
        'cancelledByCustomer': 'CANCELLED',
        'cancelledBySp': 'CANCELLED',
        'ontheway': 'ONTHEWAY',
        'reached': 'REACHED',
        'ongoing': 'ONGOING',
        'completed': 'COMPLETED',
    };
    return statusMap[status] || 'REQUESTED';
};

// Map API booking status to list view status (for filtering)
const mapBookingStatusToList = (status: string): ListStatus => {
    const statusMap: Record<string, ListStatus> = {
        'requested': 'UPCOMING',
        'accepted': 'ONGOING',
        'rejected': 'CANCELLED',
        'rescheduledByCustomer': 'UPCOMING',
        'rescheduledBySp': 'UPCOMING',
        'cancelledByCustomer': 'CANCELLED',
        'cancelledBySp': 'CANCELLED',
        'ontheway': 'ONGOING',
        'reached': 'ONGOING',
        'ongoing': 'ONGOING',
        'completed': 'COMPLETED',
    };
    return statusMap[status] || 'UPCOMING';
};

// Get display label for status
const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        'requested': 'Requested',
        'accepted': 'Accepted',
        'rejected': 'Rejected',
        'rescheduledByCustomer': 'Rescheduled',
        'rescheduledBySp': 'Rescheduled',
        'cancelledByCustomer': 'Cancelled',
        'cancelledBySp': 'Cancelled',
        'onTheWay': 'On The Way',
        'reached': 'Reached',
        'ongoing': 'Ongoing',
        'completed': 'Completed',
    };
    return statusMap[status] || status || 'Requested';
};

const getStatusColor = (status: any) => {
    switch (status) {
        case 'requested':
            return Colors.warningColor || '#FF9800';
        case 'accepted':
            return '#4CAF50';
        case 'rejected':
            return Colors.red || '#F44336';
        case 'rescheduledByCustomer':
            return Colors.primary_light || Colors.primary;
        case 'cancelledByCustomer':
            return Colors.red || '#F44336';
        case 'cancelledBySp':
            return Colors.red || '#F44336';
        case 'ontheway':
            return '#FF9800';
        case 'reached':
            return '#2196F3';
        case 'ongoing':
            return '#009BFF';
        case 'completed':
            return '#4CAF50';
        default:
            return Colors.text;
    }
};
const formatAddress = ({
    line1 = '',
    line2 = '',
    landmark = '',
    pincode = '',
    city = '',
    country = '',
  }: {
    line1: string;
    line2: string;
    landmark: string;
    pincode: string;
    city: string;
    country: string;
  }): string => {
    return [line1, line2, landmark, pincode, city, country]
      .filter(value => value && value.trim() !== '')
      .join(', ');
  };
  
// Check if status is cancelled or rejected
const isCancelledOrRejected = (status: string): boolean => {
    const cancelledStatuses = ['rejected', 'cancelledByCustomer', 'cancelledBySp'];
    return cancelledStatuses.includes(status);
};


 const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const permission: Permission | undefined = Platform.select({
      ios: PERMISSIONS.IOS.CONTACTS,
      android: PERMISSIONS.ANDROID.READ_CONTACTS,
    });

    if (!permission) return false;

    // 🔹 Check current status
    const status = await check(permission);

    // ✅ Already granted
    if (status === RESULTS.GRANTED) {
      return true;
    }

    // 🔹 First time or denied
    if (status === RESULTS.DENIED) {
      const requestStatus = await request(permission);
      return requestStatus === RESULTS.GRANTED;
    }

    // 🔹 Blocked (Don't ask again selected)
    if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Contacts Permission Required',
        'Contacts access is blocked. Please enable it from settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
      return false;
    }

    // 🔹 Unavailable (device restriction / simulator)
    if (status === RESULTS.UNAVAILABLE) {
      Alert.alert(
        'Contacts Unavailable',
        'Contacts are not available on this device.',
      );
      return false;
    }

    return false;
  } catch (error) {
    console.log('Contacts Permission Error:', error);
    return false;
  }
};


export { formatDate, formatBookingAddress, mapBookingStatusToDisplay, mapBookingStatusToList, getStatusLabel, isCancelledOrRejected, getStatusColor ,formatAddress,requestContactsPermission};