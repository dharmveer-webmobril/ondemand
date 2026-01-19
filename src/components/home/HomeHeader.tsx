import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { ThemeType, useThemeContext } from '@utils/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomText, VectoreIcons, showToast } from '@components/common';
import { CountryModal } from '@components';
import imagePaths from '@assets';
import { useProfile, useUpdateProfile } from '@services/api/queries/authQueries';
import { useGetCities } from '@services/api/queries/appQueries';
import { useAppDispatch } from '@store/hooks';
import { updateUserDetails } from '@store/slices/authSlice';
import { useQueryClient } from '@tanstack/react-query';

interface City {
  _id: string;
  name: string;
}

type HomeHeaderProps = {
  onCityUpdate?: () => void;
  onCityUpdateLoading?: (isLoading: boolean) => void;
};

export default function HomeHeader({ onCityUpdate, onCityUpdateLoading }: HomeHeaderProps) {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const updateProfileMutation = useUpdateProfile();

  // Notify parent about loading state
  React.useEffect(() => {
    if (onCityUpdateLoading) {
      onCityUpdateLoading(updateProfileMutation.isPending);
    }
  }, [updateProfileMutation.isPending, onCityUpdateLoading]);

  // Get user profile
  const { data: profileData, refetch: refetchProfile } = useProfile(true);
  const userProfile = profileData?.ResponseData;

  // Get country ID from user profile
  const countryId = useMemo(() => {
    return userProfile?.country?._id || userProfile?.country || null;
  }, [userProfile]);

  // Get current city from user profile
  const currentCity = useMemo(() => {
    return userProfile?.city?.name || userProfile?.city || 'Select City';
  }, [userProfile]);

  const currentCityId = useMemo(() => {
    return userProfile?.city?._id || userProfile?.city || null;
  }, [userProfile]);

  // Fetch cities based on country
  const { data: citiesData, isLoading: citiesLoading } = useGetCities(countryId);

  const cities = useMemo(() => {
    return citiesData?.ResponseData || [];
  }, [citiesData]);

  // Set selected city when profile loads
  useEffect(() => {
    if (currentCityId && cities.length > 0) {
      const foundCity = cities.find((c: City) => c._id === currentCityId);
      if (foundCity) {
        setSelectedCity(foundCity);
      }
    }
  }, [currentCityId, cities]);

  const handleCitySelect = async (city: City) => {
    if (!countryId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select a country first',
      });
      return;
    }

    try {
      // Update only city in profile
      const data = {
        city: city._id,
      };

      const response = await updateProfileMutation.mutateAsync(data);
      
      if (response.succeeded && response.ResponseCode === 200) {
        // Update Redux store
        dispatch(updateUserDetails(response.ResponseData));
        
        // Refetch profile
        await refetchProfile();
        
        // Invalidate and refetch home data
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['banners'] });
        queryClient.invalidateQueries({ queryKey: ['serviceProviders'] });
        
        // Call parent refresh callback if provided
        if (onCityUpdate) {
          onCityUpdate();
        }

        // showToast({
        //   type: 'success',
        //   title: 'Success',
        //   message: response.ResponseMessage || 'City updated successfully',
        // });

        setShowCityModal(false);
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.ResponseMessage || 'Failed to update city',
        });
      }
    } catch (error: any) {
      console.error('Error updating city:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.ResponseMessage || 'Failed to update city',
      });
    }
  };

  const handleLocationPress = () => {
    if (!countryId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Country not found. Please update your profile.',
      });
      return;
    }
    setShowCityModal(true);
  };

  return (
    <>
    <LinearGradient
      colors={['#011321', '#066AB7', '#009BFF']}
      style={[
        styles.headerContainer,
        { paddingTop: insets.top }
      ]}
    >
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <VectoreIcons
            name="location-sharp"
            size={24}
            icon="Ionicons"
            color={'white'}
          />
          <View style={styles.locationContainer}>
            <CustomText style={styles.currentLocationText}>Current Location</CustomText>
              <TouchableOpacity 
                style={styles.locationRow}
                onPress={handleLocationPress}
                activeOpacity={0.7}
              >
              <CustomText numberOfLines={1} style={styles.cityText}>
                  {currentCity}
              </CustomText>
              <Image source={imagePaths.down} style={styles.downIcon} />
              </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rightView}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => { }}
          >
            <Image source={imagePaths.calender_icon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => { }}
          >
            <Image source={imagePaths.notification_icon} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>

      {/* City Modal */}
      <CountryModal
        type='city'
        data={cities}
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        onSelect={handleCitySelect}
        selectedId={selectedCity?._id || currentCityId}
        isLoading={citiesLoading}
      />
    </>
  )
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 15
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  locationContainer: {
    marginLeft: 5
  },
  locationTitle: {
    color: theme.colors.whitetext,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.MEDIUM
  },
  locationValue: {
    marginTop: 2,
    color: theme.colors.whitetext,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.SEMI_BOLD
  },
  leftContainer: { flexDirection: 'row', alignItems: 'center' },
  currentLocationText: {
    fontSize: theme.SF(12),
    color: theme.colors.whitetext,
    fontFamily: theme.fonts.SEMI_BOLD,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cityText: {
    fontSize: theme.SF(14),
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.BOLD,
  },
  downIcon: {
    height: theme.SH(12),
    width: theme.SH(12),
    marginLeft: theme.SW(7),
    resizeMode: 'contain',
  },
  rightView: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    paddingHorizontal: theme.SW(5),
  },
  icon: {
    height: theme.SF(27),
    width: theme.SF(27),
    resizeMode: 'contain',
  },
})